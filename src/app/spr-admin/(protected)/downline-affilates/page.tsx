import DownlineAffiliates from "@/spr-admin/features/downline-affilates/components/downlineAffiliates";

export default function DownlineAffiliatesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6">
        <DownlineAffiliates />
      </div>
    </div>
  );
}