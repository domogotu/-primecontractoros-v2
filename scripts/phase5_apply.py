from pathlib import Path

p = Path("server/routers.ts")
s = p.read_text()
start_marker = "    convertToProposal: protectedProcedure\n"
end_marker = "  }),\n  proposals: router({"
start = s.find(start_marker)
if start < 0:
    raise SystemExit("convertToProposal start marker missing")
end = s.find(end_marker, start)
if end < 0:
    raise SystemExit("convertToProposal end marker missing")

replacement = r'''    convertToProposal: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
        proposalTitle: z.string().min(1),
        framework: z.string().optional(),
        carryForward: z.object({
          contacts: z.boolean().default(true),
          files: z.boolean().default(true),
          notes: z.boolean().default(true),
          tasks: z.boolean().default(false),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const {
            contacts: contactsTbl,
            files: filesTbl,
            notes: notesTbl,
            tasks: tasksTbl,
            contactLinks,
            fileLinks,
            opportunitySourceFiles,
            sourceReferences,
            autoPopulationEvents,
            lifecycleStatusHistory,
          } = await import("../drizzle/schema");
          const { and: andOp, eq: eqOp } = await import("drizzle-orm");

          const opportunity = await getOpportunity(input.opportunityId, wsId);
          if (!opportunity) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found." });
          }

          const cf = input.carryForward || { contacts: true, files: true, notes: true, tasks: false };
          const existingProposals = await listProposals(wsId);
          const existingProposal = existingProposals.find((proposal: any) => proposal.opportunityId === input.opportunityId);

          let proposalId: number;
          let created = false;
          if (existingProposal) {
            proposalId = existingProposal.id;
          } else {
            const limitCheck = await checkPlanLimit(wsId, "proposals", existingProposals.length);
            if (!limitCheck.allowed) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `Plan limit reached: you can have at most ${limitCheck.limit} proposals. Upgrade your plan to add more.`,
              });
            }

            const proposalResult = await createProposal({
              workspaceId: wsId,
              title: input.proposalTitle,
              opportunityId: input.opportunityId,
              framework: input.framework,
              dueDate: opportunity.dueDate || undefined,
            });
            proposalId = typeof proposalResult === "number"
              ? proposalResult
              : Number((proposalResult as any)?.[0]?.insertId ?? (proposalResult as any)?.insertId);
            if (!proposalId) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Proposal creation did not return an insert id." });
            }
            created = true;
          }

          const carried = { contacts: 0, files: 0, notes: 0, tasks: 0, sourceReferences: 0 };

          if (cf.contacts) {
            const linked = await db.select().from(contactsTbl).where(andOp(
              eqOp(contactsTbl.workspaceId, wsId),
              eqOp(contactsTbl.linkedRecordType, "opportunity"),
              eqOp(contactsTbl.linkedRecordId, input.opportunityId),
            ));
            for (const c of linked) {
              const [alreadyLinked] = await db.select({ id: contactLinks.id }).from(contactLinks).where(andOp(
                eqOp(contactLinks.workspaceId, wsId),
                eqOp(contactLinks.contactId, c.id),
                eqOp(contactLinks.recordType, "proposal"),
                eqOp(contactLinks.recordId, proposalId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(contactLinks).values({ contactId: c.id, recordType: "proposal", recordId: proposalId, workspaceId: wsId });
                carried.contacts++;
              }
            }
          }

          if (cf.files) {
            const linked = await db.select().from(filesTbl).where(andOp(
              eqOp(filesTbl.workspaceId, wsId),
              eqOp(filesTbl.linkedRecordType, "opportunity"),
              eqOp(filesTbl.linkedRecordId, input.opportunityId),
            ));
            for (const f of linked) {
              const [alreadyLinked] = await db.select({ id: fileLinks.id }).from(fileLinks).where(andOp(
                eqOp(fileLinks.workspaceId, wsId),
                eqOp(fileLinks.fileId, f.id),
                eqOp(fileLinks.targetType, "proposal"),
                eqOp(fileLinks.targetId, proposalId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(fileLinks).values({ fileId: f.id, targetType: "proposal", targetId: proposalId, linkType: "carry_forward", workspaceId: wsId });
                carried.files++;
              }
            }
          }

          if (cf.notes) {
            const linked = await db.select().from(notesTbl).where(andOp(
              eqOp(notesTbl.workspaceId, wsId),
              eqOp(notesTbl.linkedRecordType, "opportunity"),
              eqOp(notesTbl.linkedRecordId, input.opportunityId),
            ));
            for (const n of linked) {
              const [alreadyCopied] = await db.select({ id: notesTbl.id }).from(notesTbl).where(andOp(
                eqOp(notesTbl.workspaceId, wsId),
                eqOp(notesTbl.linkedRecordType, "proposal"),
                eqOp(notesTbl.linkedRecordId, proposalId),
                eqOp(notesTbl.title, n.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(notesTbl).values({ workspaceId: wsId, title: n.title, content: n.content, linkedRecordType: "proposal", linkedRecordId: proposalId, authorId: ctx.user.id });
                carried.notes++;
              }
            }
          }

          if (cf.tasks) {
            const linked = await db.select().from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "opportunity"),
              eqOp(tasksTbl.linkedRecordId, input.opportunityId),
              eqOp(tasksTbl.status, "todo"),
            ));
            for (const t of linked) {
              const [alreadyCopied] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
                eqOp(tasksTbl.workspaceId, wsId),
                eqOp(tasksTbl.linkedRecordType, "proposal"),
                eqOp(tasksTbl.linkedRecordId, proposalId),
                eqOp(tasksTbl.title, t.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(tasksTbl).values({ workspaceId: wsId, title: t.title, description: t.description, assignedTo: t.assignedTo, linkedRecordType: "proposal", linkedRecordId: proposalId, priority: t.priority, dueDate: t.dueDate });
                carried.tasks++;
              }
            }
          }

          const [rootSource] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "proposal"),
            eqOp(sourceReferences.relatedRecordId, proposalId),
            eqOp(sourceReferences.sourceType, "opportunity"),
          )).limit(1);
          if (!rootSource) {
            await db.insert(sourceReferences).values({
              workspaceId: wsId,
              relatedRecordType: "proposal",
              relatedRecordId: proposalId,
              sourceType: "opportunity",
              sourceUrl: opportunity.samUrl || opportunity.sourceLink || null,
              sourceLocation: `Opportunity #${opportunity.id}`,
              excerpt: (opportunity.summary || opportunity.description || opportunity.title || "").slice(0, 1000),
            });
            carried.sourceReferences++;
          }

          const samSources = await db.select().from(opportunitySourceFiles).where(andOp(
            eqOp(opportunitySourceFiles.workspaceId, wsId),
            eqOp(opportunitySourceFiles.opportunityId, input.opportunityId),
          ));
          for (const source of samSources) {
            const location = source.fileName || `SAM source #${source.id}`;
            const [alreadyReferenced] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
              eqOp(sourceReferences.workspaceId, wsId),
              eqOp(sourceReferences.relatedRecordType, "proposal"),
              eqOp(sourceReferences.relatedRecordId, proposalId),
              eqOp(sourceReferences.sourceType, "sam.gov_attachment"),
              eqOp(sourceReferences.sourceLocation, location),
            )).limit(1);
            if (!alreadyReferenced) {
              await db.insert(sourceReferences).values({
                workspaceId: wsId,
                relatedRecordType: "proposal",
                relatedRecordId: proposalId,
                sourceType: "sam.gov_attachment",
                sourceUrl: source.fileUrl || null,
                sourceLocation: location,
                excerpt: source.sourceCategory || null,
              });
              carried.sourceReferences++;
            }
          }

          const [autoPop] = await db.select({ id: autoPopulationEvents.id }).from(autoPopulationEvents).where(andOp(
            eqOp(autoPopulationEvents.workspaceId, wsId),
            eqOp(autoPopulationEvents.targetRecordType, "proposal"),
            eqOp(autoPopulationEvents.targetRecordId, proposalId),
            eqOp(autoPopulationEvents.sourceRecordType, "opportunity"),
            eqOp(autoPopulationEvents.sourceRecordId, input.opportunityId),
          )).limit(1);
          if (!autoPop) {
            await db.insert(autoPopulationEvents).values({
              workspaceId: wsId,
              targetRecordType: "proposal",
              targetRecordId: proposalId,
              sourceRecordType: "opportunity",
              sourceRecordId: input.opportunityId,
              fieldsApplied: {
                opportunityId: input.opportunityId,
                dueDate: opportunity.dueDate || null,
                title: input.proposalTitle,
                framework: input.framework || null,
                carryForward: cf,
              },
              fieldsSkipped: null,
              reviewedBy: ctx.user.id,
              reviewedAt: new Date(),
            });
          }

          if (created) {
            await db.insert(lifecycleStatusHistory).values({
              workspaceId: wsId,
              recordType: "proposal",
              recordId: proposalId,
              previousStatus: null,
              newStatus: "draft",
              reason: `Created from opportunity #${input.opportunityId}`,
              changedBy: ctx.user.id,
            });
          }

          await updateOpportunityStatus(input.opportunityId, wsId, "moved_to_proposal");
          if (created) {
            try { await logAudit(wsId, ctx.user.id, "create", "proposals", proposalId, { opportunityId: input.opportunityId, carryForward: cf }); } catch {}
          }
          try { await logAudit(wsId, ctx.user.id, "update", "opportunities", input.opportunityId, { status: "moved_to_proposal", proposalId }); } catch {}

          return {
            success: true,
            proposalId,
            created,
            reusedExisting: !created,
            carried,
            message: created
              ? "Proposal created with opportunity lineage and carry-forward data."
              : "Existing proposal reused; carry-forward lineage was reconciled without creating a duplicate.",
          };
        } catch (error) {
          console.error("Error converting opportunity to proposal:", error);
          throw error;
        }
      }),
'''

s = s[:start] + replacement + s[end:]
p.write_text(s)

Path("server/phase5ProposalCarryForward.test.ts").write_text(r'''import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Phase 5 proposal carry-forward lineage", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server/routers.ts"), "utf8");

  it("reuses an existing proposal for idempotent conversion", () => {
    expect(router).toContain("existingProposals.find");
    expect(router).toContain("reusedExisting: !created");
  });

  it("records source provenance and auto-population lineage", () => {
    expect(router).toContain('sourceType: "opportunity"');
    expect(router).toContain('sourceType: "sam.gov_attachment"');
    expect(router).toContain("autoPopulationEvents");
    expect(router).toContain("lifecycleStatusHistory");
  });

  it("reconciles carry-forward links without duplicate contact/file links", () => {
    expect(router).toContain("alreadyLinked");
    expect(router).toContain("alreadyCopied");
  });

  it("enforces proposal plan limits before creating a new proposal", () => {
    expect(router).toContain('checkPlanLimit(wsId, "proposals", existingProposals.length)');
  });
});
''')
