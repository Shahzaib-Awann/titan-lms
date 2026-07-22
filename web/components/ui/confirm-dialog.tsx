"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => Promise<any>;

  onSuccess?: (result?: any) => void;

  successMessage?: string;
  errorMessage?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,

  title = "Are you sure?",
  description = "This action cannot be undone.",

  confirmText = "Confirm",
  cancelText = "Cancel",

  onConfirm,
  onSuccess,

  successMessage,
  errorMessage = "Something went wrong.",
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const result = await onConfirm();

        if (successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);

        onOpenChange(false);
      } catch (error: any) {
        toast.error(error?.message || errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-none">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>

          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
