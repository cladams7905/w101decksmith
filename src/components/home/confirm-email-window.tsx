"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { resendConfirmationEmail } from "@/db/actions/auth";

interface ConfirmEmailWindowProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export default function ConfirmEmailWindow({
  isOpen,
  onOpenChange,
  email
}: ConfirmEmailWindowProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (!error) {
        setResendSuccess(true);
      }
    } catch {
      // Handle error silently for now
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-3xl text-white">
        <div className="fixed inset-0 bg-background backdrop-blur-2xl -z-10" />
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-white">
            Confirm Your Email
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <Button
              variant="outline_primary"
              size="lg"
              className="w-14 h-14 !px-0 gap-0"
            >
              <Mail className="text-white" size={40} />
            </Button>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500/50 border border-green-500 rounded-full flex items-center justify-center z-10">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Check Your Email
            </h3>
            <p className="text-white/80 text-sm max-w-sm">
              We&apos;ve sent a confirmation email to{" "}
              <span className="font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {email}
              </span>
            </p>
            <p className="text-white/60 text-xs">
              Click the link in the email to verify your account and complete
              your registration.
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Got it!
            </Button>

            <div className="text-center">
              {resendSuccess ? (
                <p className="text-sm text-green-400">
                  Confirmation email sent!
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm text-white/60 hover:text-white/80 underline disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Didn&apos;t receive the email? Resend
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
