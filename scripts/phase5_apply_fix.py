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
