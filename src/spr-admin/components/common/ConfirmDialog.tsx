"use client";

import { Modal } from "@/spr-admin/components/ui/Modal";
import { Button } from "@/spr-admin/components/ui/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  className?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isDestructive,
  isLoading,
  className,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} className={className}>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant={isDestructive ? "destructive" : "primary"}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
