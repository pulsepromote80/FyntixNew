import DirectAffiliates from "@/spr-admin/features/direct-affilates/components/directAffiliate";

export default function DirectAffiliatesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <DirectAffiliates />
      </div>
    </div>
  );
}