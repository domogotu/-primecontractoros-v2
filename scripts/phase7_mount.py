from pathlib import Path

routers_path = Path('server/routers.ts')
routers = routers_path.read_text()
import_anchor = 'import { contextualHelpRouter, lifecycleRouter, autoPopulationRouter, sourceReferencesRouter, templateImprovementsRouter, helpArticlesRouter, glossaryRouter, dashboardDataRouter, aiSuggestionsEnhancedRouter, aiFindingsEnhancedRouter } from "./phase35Router";\n'
new_import = import_anchor + 'import { contractOperationsRouter } from "./contractOperationsRouter";\n'
if 'from "./contractOperationsRouter"' not in routers:
    if import_anchor not in routers:
        raise SystemExit('routers import anchor not found')
    routers = routers.replace(import_anchor, new_import, 1)

mount_anchor = '  deliverables: deliverablesRouter,\n'
if '  contractOperations: contractOperationsRouter,\n' not in routers:
    if mount_anchor not in routers:
        raise SystemExit('router mount anchor not found')
    routers = routers.replace(mount_anchor, mount_anchor + '  contractOperations: contractOperationsRouter,\n', 1)
routers_path.write_text(routers)

hub_path = Path('client/src/pages/ContractHubDetail.tsx')
hub = hub_path.read_text()
query_anchor = '''  const { data: contract, isLoading } = trpc.contracts.get.useQuery(
    { id: contractId! },
    { enabled: !!contractId }
  );
'''
ops_query = query_anchor + '''  const { data: operations } = trpc.contractOperations.summary.useQuery(
    { contractId: contractId! },
    { enabled: !!contractId }
  );
'''
if 'trpc.contractOperations.summary.useQuery' not in hub:
    if query_anchor not in hub:
        raise SystemExit('contract hub query anchor not found')
    hub = hub.replace(query_anchor, ops_query, 1)

section_anchor = '      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Modules</h2>\n'
ops_ui = '''      {operations && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" /> Operations & Invoice Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-md border p-3"><p className="text-xs text-gray-500">Governing Docs</p><p className="text-xl font-bold">{operations.documents.governing}</p></div>
              <div className="rounded-md border p-3"><p className="text-xs text-gray-500">Deliverables</p><p className="text-xl font-bold">{operations.deliverables.accepted}/{operations.deliverables.total}</p><p className="text-xs text-gray-500">accepted</p></div>
              <div className="rounded-md border p-3"><p className="text-xs text-gray-500">Open Tasks</p><p className="text-xl font-bold">{operations.tasks.open}</p></div>
              <div className="rounded-md border p-3"><p className="text-xs text-gray-500">Pending Mods</p><p className="text-xl font-bold">{operations.modifications.pending}</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              {operations.invoiceReadiness.status === "blocked" ? <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />}
              <div>
                <p className="font-medium">Invoice readiness: {operations.invoiceReadiness.status === "blocked" ? "Blocked" : "Manager review required"}</p>
                <p className="text-sm text-gray-600">{operations.invoiceReadiness.message}</p>
                {operations.invoiceReadiness.blockers.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {operations.invoiceReadiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-2">QASP identified: {operations.documents.qaspIdentified ? "Yes" : "Not identified / may not apply"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

'''
if 'Operations & Invoice Readiness' not in hub:
    if section_anchor not in hub:
        raise SystemExit('contract hub section anchor not found')
    hub = hub.replace(section_anchor, ops_ui + section_anchor, 1)
hub_path.write_text(hub)
