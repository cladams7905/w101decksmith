"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthConfirmContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Build the callback URL with all current search params
        const callbackUrl = new URL(
          "/api/auth/callback",
          window.location.origin
        );

        // Copy all search params to the callback URL
        searchParams.forEach((value, key) => {
          callbackUrl.searchParams.set(key, value);
        });

        console.log("Calling callback endpoint:", callbackUrl.toString());

        // Call the callback endpoint
        const response = await fetch(callbackUrl.toString());

        if (response.ok) {
          // Check if it's a redirect response
          if (response.redirected || response.url !== callbackUrl.toString()) {
            console.log("Auth verification successful!");
            setSuccess(true);

            // Extract the final redirect URL
            const redirectUrl = new URL(response.url);
            const redirectPath = redirectUrl.pathname + redirectUrl.search;

            // Short delay to show success message, then redirect
            setTimeout(() => {
              router.replace(redirectPath);
            }, 2000);
          } else {
            setError("Authentication verification failed. Please try again.");
          }
        } else {
          setError("Authentication verification failed. Please try again.");
        }
      } catch (err) {
        console.error("Auth confirmation error:", err);
        setError("An unexpected error occurred during confirmation.");
      } finally {
        setLoading(false);
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="backdrop-blur-3xl text-white rounded-xl border p-8">
      <div className="fixed inset-0 bg-background backdrop-blur-2xl -z-10 rounded-xl" />

      {loading && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Confirming your account...
          </h1>
          <p className="text-white/60 text-sm">
            Please wait while we verify your email confirmation.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center">
          <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            Account Confirmation Failed
          </h1>
          <p className="text-white/60 text-sm mb-6">
            There was a problem confirming your account. You can try signing up
            again or contact support if the issue persists.
          </p>

          <Button
            variant="outline_primary"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      )}

      {success && !loading && !error && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            Account Confirmed!
          </h1>
          <p className="text-white/60 text-sm mb-4">
            Your account has been successfully confirmed. Redirecting you now...
          </p>

          <div className="flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
          </div>
        </div>
      )}
    </div>
  );
}

function AuthConfirmFallback() {
  return (
    <div className="backdrop-blur-3xl text-white rounded-xl border p-8">
      <div className="fixed inset-0 bg-background backdrop-blur-2xl -z-10 rounded-xl" />
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Loading...</h1>
        <p className="text-white/60 text-sm">
          Preparing your confirmation page.
        </p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl">
        <Suspense fallback={<AuthConfirmFallback />}>
          <AuthConfirmContent />
        </Suspense>
      </div>
    </div>
  );
}
