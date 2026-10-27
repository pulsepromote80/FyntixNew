"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { EditProfileForm } from "./components/EditProfileForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { Manage2FAForm } from "./components/Manage2FAForm";

export default function ProfilePage() {
  const tabs = [
    {
      id: "edit-profile",
      label: "Edit Profile",
      content: <EditProfileForm />,
    },
    {
      id: "change-password",
      label: "Change password",
      content: <ChangePasswordForm />,
    },
    {
      id: "manage-2fa",
      label: "Manage 2FA",
      content: <Manage2FAForm />,
    },
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal information." />
      <Tabs tabs={tabs} defaultTab="edit-profile" card />
    </div>
  );
}
