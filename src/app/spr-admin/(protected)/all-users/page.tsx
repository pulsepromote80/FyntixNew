import UserManagement from "@/spr-admin/features/all-users/components/userManagement";

export default function UsersManagementPage() {
  return (
    <div className="flex w-full flex-col gap-6">
    

      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <UserManagement />
      </div>
    </div>
  );
}