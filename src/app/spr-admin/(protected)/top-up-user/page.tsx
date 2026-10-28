import TopupUser from "@/spr-admin/features/top-up-user/components/topupUser";

export default function TopupUserPage() {
  return (
    <div className="flex w-full h-full flex-col overflow-hidden p-4">
      <div className="flex w-full h-full justify-center">
        <TopupUser />
      </div>
    </div>
  );
}