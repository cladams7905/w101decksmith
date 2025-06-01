"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SignInModal from "./sign-in-modal";
import Image from "next/image";
import { useState } from "react";
import DecksmithLogo from "@/../public/DeckSmith_Logo.svg";

export default function HomeNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");

  return (
    <header className="border-b border-border/40 sticky top-0 backdrop-blur-sm z-40 animate-fade-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Image
                src={DecksmithLogo}
                alt="DeckSmith"
                width={32}
                height={32}
                className="rounded-lg"
                priority
              />
              <h1 className="text-lg md:text-xl font-bold text-white">
                DeckSmith
              </h1>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hidden md:block"
            >
              Community
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <SignInModal
              isOpen={isLoginModalOpen}
              onOpenChange={setIsLoginModalOpen}
              loginMode={loginMode}
              onLoginModeChange={setLoginMode}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => setLoginMode("login")}
                >
                  Login
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  variant="outline_primary"
                  onClick={() => setLoginMode("signup")}
                >
                  Sign Up
                </Button>
              </DialogTrigger>
            </SignInModal>
          </div>

          {/* Mobile Navigation with Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 sm:w-72 bg-background px-6 border border-border"
            >
              <DialogTitle className="sr-only">DeckSmith</DialogTitle>
              <div className="flex flex-col space-y-4 mt-8">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Community
                </Button>
                <SignInModal
                  isOpen={isLoginModalOpen}
                  onOpenChange={setIsLoginModalOpen}
                  loginMode={loginMode}
                  onLoginModeChange={setLoginMode}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/10 justify-start"
                      onClick={() => {
                        setLoginMode("login");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline_primary"
                      className="justify-start"
                      onClick={() => {
                        setLoginMode("signup");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </DialogTrigger>
                </SignInModal>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
