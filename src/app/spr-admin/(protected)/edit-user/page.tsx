

import EditUserProfile from "@/spr-admin/features/edit-user/components/editUser";

export default function EditUserPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <EditUserProfile />
      </div>

    </div>
  );
}