import IntelligentTreeView from "@/spr-admin/features/intelligent-tree-view/components/inteliigentTreeView";

export default function IntelligentTreeViewPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <IntelligentTreeView />
      </div>
    </div>
  );
}