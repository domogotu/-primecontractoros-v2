from pathlib import Path
import re

path = Path('server/routers.ts')
text = path.read_text()
pattern = re.compile(r'    convertToContract: protectedProcedure.*?\n      \}\),\n  \}\),\n  contracts: router\(\{', re.S)
replacement = r'''    convertToContract: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        contractTitle: z.string().min(1),
        contractNumber: z.string().optional(),
        carryForward: z.object({
          contacts: z.boolean().default(true),
          files: z.boolean().default(true),
          notes: z.boolean().default(true),
          tasks: z.boolean().default(false),
          deliverables: z.boolean().default(true),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const {
            contacts: contactsTbl,
            files: filesTbl,
            notes: notesTbl,
            tasks: tasksTbl,
            contracts: contractsTbl,
            contactLinks,
            fileLinks,
            sourceReferences,
            autoPopulationEvents,
            lifecycleStatusHistory,
          } = await import("../drizzle/schema");
          const { and: andOp, eq: eqOp, isNull: isNullOp } = await import("drizzle-orm");

          const proposal = await getProposal(input.proposalId, wsId);
          if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found." });
          const cf = input.carryForward || { contacts: true, files: true, notes: true, tasks: false, deliverables: true };

          const existingContracts = await db.select().from(contractsTbl).where(andOp(
            eqOp(contractsTbl.workspaceId, wsId),
            eqOp(contractsTbl.proposalId, input.proposalId),
          ));
          let contractId = existingContracts[0]?.id;
          let created = false;

          if (!contractId) {
            const allContracts = await listContracts(wsId);
            const limitCheck = await checkPlanLimit(wsId, "contracts", allContracts.length);
            if (!limitCheck.allowed) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `Plan limit reached: you can have at most ${limitCheck.limit} contracts. Upgrade your plan to add more.`,
              });
            }
            const opportunity = proposal.opportunityId ? await getOpportunity(proposal.opportunityId, wsId) : null;
            const contractResult = await createContract({
              workspaceId: wsId,
              title: input.contractTitle,
              proposalId: input.proposalId,
              contractNumber: input.contractNumber || undefined,
              agency: opportunity?.agency || undefined,
            });
            contractId = typeof contractResult === "number"
              ? contractResult
              : Number((contractResult as any)?.[0]?.insertId ?? (contractResult as any)?.insertId);
            if (!contractId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Contract creation did not return an insert id." });
            created = true;
          }

          const carried = { contacts: 0, files: 0, notes: 0, tasks: 0, sourceReferences: 0, deliverableSetupTasks: 0 };

          if (cf.contacts) {
            const contactIds = new Set<number>();
            const directContacts = await db.select({ id: contactsTbl.id }).from(contactsTbl).where(andOp(
              eqOp(contactsTbl.workspaceId, wsId),
              eqOp(contactsTbl.linkedRecordType, "proposal"),
              eqOp(contactsTbl.linkedRecordId, input.proposalId),
            ));
            directContacts.forEach((row) => contactIds.add(row.id));
            const proposalContactLinks = await db.select({ contactId: contactLinks.contactId }).from(contactLinks).where(andOp(
              eqOp(contactLinks.workspaceId, wsId),
              eqOp(contactLinks.recordType, "proposal"),
              eqOp(contactLinks.recordId, input.proposalId),
            ));
            proposalContactLinks.forEach((row) => contactIds.add(row.contactId));
            for (const contactId of contactIds) {
              const [alreadyLinked] = await db.select({ id: contactLinks.id }).from(contactLinks).where(andOp(
                eqOp(contactLinks.workspaceId, wsId),
                eqOp(contactLinks.contactId, contactId),
                eqOp(contactLinks.recordType, "contract"),
                eqOp(contactLinks.recordId, contractId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(contactLinks).values({ contactId, recordType: "contract", recordId: contractId, workspaceId: wsId });
                carried.contacts++;
              }
            }
          }

          if (cf.files) {
            const fileIds = new Set<number>();
            const directFiles = await db.select({ id: filesTbl.id }).from(filesTbl).where(andOp(
              eqOp(filesTbl.workspaceId, wsId),
              eqOp(filesTbl.linkedRecordType, "proposal"),
              eqOp(filesTbl.linkedRecordId, input.proposalId),
            ));
            directFiles.forEach((row) => fileIds.add(row.id));
            const proposalFileLinks = await db.select({ fileId: fileLinks.fileId }).from(fileLinks).where(andOp(
              eqOp(fileLinks.workspaceId, wsId),
              eqOp(fileLinks.targetType, "proposal"),
              eqOp(fileLinks.targetId, input.proposalId),
            ));
            proposalFileLinks.forEach((row) => fileIds.add(row.fileId));
            for (const fileId of fileIds) {
              const [alreadyLinked] = await db.select({ id: fileLinks.id }).from(fileLinks).where(andOp(
                eqOp(fileLinks.workspaceId, wsId),
                eqOp(fileLinks.fileId, fileId),
                eqOp(fileLinks.targetType, "contract"),
                eqOp(fileLinks.targetId, contractId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(fileLinks).values({ fileId, targetType: "contract", targetId: contractId, linkType: "carry_forward", workspaceId: wsId });
                carried.files++;
              }
            }
          }

          if (cf.notes) {
            const linked = await db.select().from(notesTbl).where(andOp(
              eqOp(notesTbl.workspaceId, wsId),
              eqOp(notesTbl.linkedRecordType, "proposal"),
              eqOp(notesTbl.linkedRecordId, input.proposalId),
            ));
            for (const n of linked) {
              const [alreadyCopied] = await db.select({ id: notesTbl.id }).from(notesTbl).where(andOp(
                eqOp(notesTbl.workspaceId, wsId),
                eqOp(notesTbl.linkedRecordType, "contract"),
                eqOp(notesTbl.linkedRecordId, contractId),
                n.title === null ? isNullOp(notesTbl.title) : eqOp(notesTbl.title, n.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(notesTbl).values({ workspaceId: wsId, title: n.title, content: n.content, linkedRecordType: "contract", linkedRecordId: contractId, authorId: ctx.user.id });
                carried.notes++;
              }
            }
          }

          if (cf.tasks) {
            const linked = await db.select().from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "proposal"),
              eqOp(tasksTbl.linkedRecordId, input.proposalId),
              eqOp(tasksTbl.status, "todo"),
            ));
            for (const t of linked) {
              const [alreadyCopied] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
                eqOp(tasksTbl.workspaceId, wsId),
                eqOp(tasksTbl.linkedRecordType, "contract"),
                eqOp(tasksTbl.linkedRecordId, contractId),
                eqOp(tasksTbl.title, t.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(tasksTbl).values({ workspaceId: wsId, title: t.title, description: t.description, assignedTo: t.assignedTo, linkedRecordType: "contract", linkedRecordId: contractId, priority: t.priority, dueDate: t.dueDate });
                carried.tasks++;
              }
            }
          }

          const proposalSources = await db.select().from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "proposal"),
            eqOp(sourceReferences.relatedRecordId, input.proposalId),
          ));
          for (const source of proposalSources) {
            const location = source.sourceLocation || `Proposal source #${source.id}`;
            const [alreadyReferenced] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
              eqOp(sourceReferences.workspaceId, wsId),
              eqOp(sourceReferences.relatedRecordType, "contract"),
              eqOp(sourceReferences.relatedRecordId, contractId),
              eqOp(sourceReferences.sourceType, source.sourceType),
              eqOp(sourceReferences.sourceLocation, location),
            )).limit(1);
            if (!alreadyReferenced) {
              await db.insert(sourceReferences).values({
                workspaceId: wsId,
                relatedRecordType: "contract",
                relatedRecordId: contractId,
                sourceType: source.sourceType,
                sourceUrl: source.sourceUrl,
                sourceLocation: location,
                excerpt: source.excerpt,
              });
              carried.sourceReferences++;
            }
          }

          const [proposalLineage] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "contract"),
            eqOp(sourceReferences.relatedRecordId, contractId),
            eqOp(sourceReferences.sourceType, "proposal"),
          )).limit(1);
          if (!proposalLineage) {
            await db.insert(sourceReferences).values({
              workspaceId: wsId,
              relatedRecordType: "contract",
              relatedRecordId: contractId,
              sourceType: "proposal",
              sourceLocation: `Proposal #${input.proposalId}`,
              excerpt: proposal.title,
            });
            carried.sourceReferences++;
          }

          const [autoPop] = await db.select({ id: autoPopulationEvents.id }).from(autoPopulationEvents).where(andOp(
            eqOp(autoPopulationEvents.workspaceId, wsId),
            eqOp(autoPopulationEvents.targetRecordType, "contract"),
            eqOp(autoPopulationEvents.targetRecordId, contractId),
            eqOp(autoPopulationEvents.sourceRecordType, "proposal"),
            eqOp(autoPopulationEvents.sourceRecordId, input.proposalId),
          )).limit(1);
          if (!autoPop) {
            await db.insert(autoPopulationEvents).values({
              workspaceId: wsId,
              targetRecordType: "contract",
              targetRecordId: contractId,
              sourceRecordType: "proposal",
              sourceRecordId: input.proposalId,
              fieldsApplied: { proposalId: input.proposalId, title: input.contractTitle, contractNumber: input.contractNumber || null, carryForward: cf },
              fieldsSkipped: null,
              reviewedBy: ctx.user.id,
              reviewedAt: new Date(),
            });
          }

          if (cf.deliverables) {
            const setupTitle = "Establish contract deliverables from governing award";
            const [existingSetupTask] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "contract"),
              eqOp(tasksTbl.linkedRecordId, contractId),
              eqOp(tasksTbl.title, setupTitle),
            )).limit(1);
            if (!existingSetupTask) {
              await db.insert(tasksTbl).values({
                workspaceId: wsId,
                title: setupTitle,
                description: "Review the governing award, incorporated solicitation/amendments, acceptance terms, CLINs, QASP, and modifications. Create contract deliverable records only after award requirements are confirmed.",
                linkedRecordType: "contract",
                linkedRecordId: contractId,
                priority: "high",
                status: "todo",
              });
              carried.deliverableSetupTasks++;
            }
          }

          if (created) {
            await db.insert(lifecycleStatusHistory).values({
              workspaceId: wsId,
              recordType: "contract",
              recordId: contractId,
              previousStatus: null,
              newStatus: "setup",
              reason: `Created from awarded proposal #${input.proposalId}`,
              changedBy: ctx.user.id,
            });
          }

          await updateProposalStatus(input.proposalId, wsId, "won");
          if (created) {
            try { await logAudit(wsId, ctx.user.id, "create", "contracts", contractId, { proposalId: input.proposalId, carryForward: cf }); } catch {}
            dispatchWebhookEvent(wsId, "contract.created", { proposalId: input.proposalId, contractId, title: input.contractTitle }).catch(() => {});
          }
          try { await logAudit(wsId, ctx.user.id, "update", "proposals", input.proposalId, { status: "won", contractId }); } catch {}

          return {
            success: true,
            contractId,
            created,
            reusedExisting: !created,
            carried,
            deliverablesPendingAwardReview: cf.deliverables,
          };
        } catch (error) {
          console.error("Error converting proposal to contract:", error);
          throw error;
        }
      }),
  }),
  contracts: router({'''

new_text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'Expected exactly one convertToContract block, replaced {count}')
path.write_text(new_text)

Path('server/phase6AwardConversion.test.ts').write_text('''import { describe, expect, it } from "vitest";\nimport fs from "node:fs";\nimport path from "node:path";\n\ndescribe("Phase 6 award conversion", () => {\n  const router = fs.readFileSync(path.join(process.cwd(), "server/routers.ts"), "utf8");\n\n  it("uses contract-management authorization and plan limits", () => {\n    expect(router).toContain('enforceAction(ctx.user.id, "manage_contracts")');\n    expect(router).toContain('checkPlanLimit(wsId, "contracts", allContracts.length)');\n  });\n\n  it("reuses an existing contract for the same proposal", () => {\n    expect(router).toContain('eqOp(contractsTbl.proposalId, input.proposalId)');\n    expect(router).toContain('reusedExisting: !created');\n  });\n\n  it("carries Phase 5 link-table relationships into the contract without duplicates", () => {\n    expect(router).toContain('proposalContactLinks');\n    expect(router).toContain('proposalFileLinks');\n    expect(router).toContain('alreadyLinked');\n  });\n\n  it("records proposal provenance, auto-population lineage, and contract lifecycle history", () => {\n    expect(router).toContain('sourceType: "proposal"');\n    expect(router).toContain('targetRecordType: "contract"');\n    expect(router).toContain('newStatus: "setup"');\n  });\n\n  it("keeps award-governed deliverables review-first and idempotent", () => {\n    expect(router).toContain('Establish contract deliverables from governing award');\n    expect(router).toContain('deliverablesPendingAwardReview');\n    expect(router).toContain('existingSetupTask');\n  });\n});\n''')
