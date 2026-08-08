from pathlib import Path

for filename in ['server/batch1Router.ts', 'server/batch2Router.ts']:
    p = Path(filename)
    s = p.read_text()
    s = s.replace('const db = await getDb();', 'const db = await getDb();\n    if (!db) throw new Error("Database not available");')
    p.write_text(s)

p = Path('server/batch1Router.ts')
s = p.read_text()
s = s.replace(
    'await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: JSON.stringify({ [input.step]: input.completed }), currentStep: input.step, completed: false });',
    'await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: { [input.step]: input.completed }, stepData: { currentStepKey: input.step }, status: "in_progress" });'
)
s = s.replace(
    'const current = JSON.parse(existing[0].completedSteps || "{}");\n      current[input.step] = input.completed;\n      await db.update(onboardingProgress).set({ completedSteps: JSON.stringify(current), currentStep: input.step }).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));',
    'const current = (existing[0].completedSteps && typeof existing[0].completedSteps === "object" ? { ...(existing[0].completedSteps as Record<string, boolean>) } : {}) as Record<string, boolean>;\n      current[input.step] = input.completed;\n      await db.update(onboardingProgress).set({ completedSteps: current, stepData: { currentStepKey: input.step } }).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));'
)
p.write_text(s)

p = Path('server/batch2Router.ts')
s = p.read_text()
s = s.replace(
    'await db.insert(vendors).values({ ...input, workspaceId: wsId });',
    'await db.insert(vendors).values({ workspaceId: wsId, companyName: input.companyName, vendorType: input.category || "general", contactName: input.contactName, email: input.email, phone: input.phone, status: input.status || "active" });'
)
old = '''    const { id, ...data } = input;
    await db.update(vendors).set(data).where(and(eq(vendors.id, id), eq(vendors.workspaceId, wsId)));'''
new = '''    const { id, category, ...data } = input;
    const vendorData: any = { ...data };
    if (category !== undefined) vendorData.vendorType = category;
    await db.update(vendors).set(vendorData).where(and(eq(vendors.id, id), eq(vendors.workspaceId, wsId)));'''
if old not in s:
    raise SystemExit('vendor update target missing')
s = s.replace(old, new, 1)
p.write_text(s)
