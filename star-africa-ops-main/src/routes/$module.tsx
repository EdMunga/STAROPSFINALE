import { createFileRoute, notFound } from "@tanstack/react-router";
import { isModuleId, modules } from "@/data/modules";
import { RecordWorkspace } from "@/components/record-workspace";
export const Route = createFileRoute("/$module")({
  beforeLoad: ({ params }) => {
    if (!isModuleId(params.module)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${isModuleId(params.module) ? modules[params.module].title : "Workspace"} · Star Africa OS`,
      },
    ],
  }),
  component: ModulePage,
});
function ModulePage() {
  const { module } = Route.useParams();
  return isModuleId(module) ? <RecordWorkspace key={module} module={module} /> : null;
}
