from pathlib import Path
p=Path('server/routers.ts')
s=p.read_text()
needle='import { contractOperationsRouter } from "./contractOperationsRouter";'
addition=needle+'\nimport { financeCloseoutRouter } from "./financeCloseoutRouter";'
if 'financeCloseoutRouter' not in s:
    s=s.replace(needle, addition)
needle2='  contractOperations: contractOperationsRouter,'
addition2=needle2+'\n  financeCloseout: financeCloseoutRouter,'
if 'financeCloseout: financeCloseoutRouter' not in s:
    s=s.replace(needle2, addition2)
p.write_text(s)
