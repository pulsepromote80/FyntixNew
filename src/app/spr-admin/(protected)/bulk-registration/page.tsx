import BulkRegistration from "@/spr-admin/features/bulk-registration/components/bulkRegistration";

export default function BulkRegistrationPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <BulkRegistration />
      </div>
    </div>
  );
}