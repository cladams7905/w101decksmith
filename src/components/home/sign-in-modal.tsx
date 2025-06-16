"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  signInSchema,
  signUpSchema,
  SignInFormData,
  SignUpFormData
} from "@/lib/validations/auth";
import { signUpWithEmailAndPassword } from "@/db/actions/auth";
import { checkIfUserExists } from "@/db/actions/users";
import { supabase } from "@/db/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import ConfirmEmailWindow from "./confirm-email-window";

interface SignInModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  loginMode: "login" | "signup";
  onLoginModeChange: (mode: "login" | "signup") => void;
  children: React.ReactNode;
}

export default function SignInModal({
  isOpen,
  onOpenChange,
  loginMode,
  onLoginModeChange,
  children
}: SignInModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  // Form for sign in
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Form for sign up
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use client-side Supabase directly for login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.error("❌ Login error:", error);
        setError(error.message);
      } else if (authData?.user && authData?.session) {
        console.log("✅ Login successful! Session established.");

        // Success - close modal
        onOpenChange(false);

        // Redirect to home page
        window.location.href = "/home";
      } else {
        console.error("❌ Login failed - no user or session returned");
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Login exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    setEmailExistsError(null);

    try {
      // First check if user already exists using the new function
      const userExists = await checkIfUserExists(data.email);

      if (userExists) {
        setEmailExistsError(
          "An account with this email already exists. Please sign in instead."
        );
        setIsLoading(false);
        return;
      }

      const { data: signUpData, error } = await signUpWithEmailAndPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        setError(error.message);
      } else if (signUpData?.user) {
        // Success - show confirmation email window
        setConfirmEmail(data.email);
        setShowConfirmEmail(true);
      } else {
        // Unexpected response
        setError("Something went wrong during signup. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailBlur = async (email: string) => {
    if (loginMode === "signup" && email && !signUpForm.formState.errors.email) {
      setIsCheckingEmail(true);
      setEmailExistsError(null);

      try {
        const userExists = await checkIfUserExists(email);
        if (userExists) {
          setEmailExistsError(
            "An account with this email already exists. Please sign in instead."
          );
        }
      } catch {
        // Silently handle error - don't block user if check fails
      } finally {
        setIsCheckingEmail(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          },
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        setError("Failed to sign in with Google. Please try again.");
        setIsLoading(false);
      }
      // If successful, the user will be redirected by Supabase
    } catch {
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleTwitchSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitch",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        setError("Failed to sign in with Twitch. Please try again.");
        setIsLoading(false);
      }
      // If successful, the user will be redirected by Supabase
    } catch {
      setError("Failed to sign in with Twitch. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        setError("Failed to sign in with Discord. Please try again.");
        setIsLoading(false);
      }
      // If successful, the user will be redirected by Supabase
    } catch {
      setError("Failed to sign in with Discord. Please try again.");
      setIsLoading(false);
    }
  };

  // Reset forms and errors when switching modes
  const handleModeChange = (mode: "login" | "signup") => {
    signInForm.reset();
    signUpForm.reset();
    setError(null);
    setEmailExistsError(null);
    onLoginModeChange(mode);
  };

  const switchToSignIn = () => {
    handleModeChange("login");
  };

  // Check if sign in button should be disabled
  const isSignInDisabled = isLoading || !signInForm.formState.isValid;

  // Check if sign up button should be disabled
  const isSignUpDisabled =
    isLoading || !signUpForm.formState.isValid || !!emailExistsError;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {children}
        <DialogContent
          className="sm:max-w-md backdrop-blur-3xl text-white overflow-hidden"
          onInteractOutside={(e) => {
            // Prevent closing when clicking outside
            e.preventDefault();
          }}
        >
          <div className="fixed inset-0 bg-background backdrop-blur-2xl -z-10" />
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">
              {loginMode === "login" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
          </DialogHeader>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline_primary"
              className="w-full"
              onClick={handleTwitchSignIn}
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
              Continue with Twitch
            </Button>

            <Button
              variant="outline_primary"
              className="w-full"
              onClick={handleDiscordSignIn}
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Continue with Discord
            </Button>

            <Button
              variant="outline_primary"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-white/60">
              or
            </span>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Email Exists Error with Switch to Sign In */}
          {emailExistsError && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <p className="text-sm text-yellow-400">{emailExistsError}</p>
              </div>
              <Button
                onClick={switchToSignIn}
                variant="outline"
                size="sm"
                className="w-full text-white border-yellow-500/50 hover:bg-yellow-500/10"
              >
                Switch to Sign In
              </Button>
            </div>
          )}

          {/* Email/Password Form - Split by mode */}
          {loginMode === "login" ? (
            <form
              onSubmit={(e) => {
                console.log("📝 Form submitted!");
                signInForm.handleSubmit(onSignIn)(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  {...signInForm.register("email")}
                  aria-invalid={!!signInForm.formState.errors.email}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-red-400">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...signInForm.register("password")}
                  aria-invalid={!!signInForm.formState.errors.password}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-400">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isSignInDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className="text-sm text-white/60 hover:text-white/80 underline"
                  disabled={isLoading}
                >
                  Don&apos;t have an account? Sign up
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={signUpForm.handleSubmit(onSignUp)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    {...signUpForm.register("email")}
                    onBlur={(e) => handleEmailBlur(e.target.value)}
                    aria-invalid={
                      !!signUpForm.formState.errors.email || !!emailExistsError
                    }
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                    </div>
                  )}
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-400">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...signUpForm.register("password")}
                  aria-invalid={!!signUpForm.formState.errors.password}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-400">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  {...signUpForm.register("confirmPassword")}
                  aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-400">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isSignUpDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="text-sm text-white/60 hover:text-white/80 underline"
                  disabled={isLoading}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmEmailWindow
        isOpen={showConfirmEmail}
        onOpenChange={setShowConfirmEmail}
        email={confirmEmail}
      />
    </>
  );
}
