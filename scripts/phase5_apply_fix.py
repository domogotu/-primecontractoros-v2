from pathlib import Path

source_path = Path("scripts/phase5_apply.py")
source = source_path.read_text()
source = source.replace(
    'const { and: andOp, eq: eqOp } = await import("drizzle-orm");',
    'const { and: andOp, eq: eqOp, isNull: isNullOp } = await import("drizzle-orm");',
)
source = source.replace(
    'eqOp(notesTbl.title, n.title),',
    'n.title === null ? isNullOp(notesTbl.title) : eqOp(notesTbl.title, n.title),',
)
exec(compile(source, str(source_path), "exec"))

# Keep the CRUD test double aligned with real Drizzle behavior: `.limit()`
# is awaitable and resolves to an array, while still exposing `.execute()`.
test_path = Path("server/crud.test.ts")
test_source = test_path.read_text()
old = 'const mockLimit = vi.fn().mockReturnValue({ execute: mockExecute });'
new = 'const mockLimitResult = Object.assign(Promise.resolve([]), { execute: mockExecute, then: (resolve: any, reject?: any) => Promise.resolve([]).then(resolve, reject) });\nconst mockLimit = vi.fn().mockReturnValue(mockLimitResult);'
if old not in test_source:
    raise SystemExit("CRUD mockLimit marker missing")
test_path.write_text(test_source.replace(old, new))
