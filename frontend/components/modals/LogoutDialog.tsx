"use client";

import Image from "next/image";
import { LogOut, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void; // direct call, no async/await UX
  withTrigger?: boolean;
  triggerClassName?: string;
};

export default function LogoutDialog({
  open,
  onOpenChange,
  onLogout,
  withTrigger = true,
  triggerClassName,
}: LogoutDialogProps) {
  const handleConfirm = () => {
    onOpenChange(false);
    onLogout();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {withTrigger && (
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={
              triggerClassName ??
              "w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-[#555555] hover:bg-neutral-100"
            }
            aria-label="Open logout dialog"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="w-[95%] sm:max-w-md rounded-2xl border border-neutral-200/70 bg-white/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-validiz-mustard/15 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-validiz-mustard" />
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo-validiz.png"
                alt="Validiz"
                width={92}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <AlertDialogTitle className="text-lg text-validiz-brown">Log out of your account?</AlertDialogTitle>

          <AlertDialogDescription className="text-[13px] text-neutral-600 leading-relaxed">
            You’ll be signed out and redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-1 sm:gap-2">
          <AlertDialogCancel className="rounded-xl w-full border-neutral-300 hover:bg-neutral-100">
            Stay logged in
          </AlertDialogCancel>

          <AlertDialogAction
            type="button"
            onClick={handleConfirm}
            className="rounded-xl w-full bg-validiz-mustard text-validiz-gray hover:bg-validiz-mustard/90 focus:ring-2 focus:ring-offset-2 focus:ring-validiz-mustard/40"
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
