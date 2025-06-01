"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileDrawer } from "@/components/app-header/header-actions/user-profile-drawer";
import Image from "next/image";
import WizardProfileImg from "@/../public/WizardProfile_Male.svg";

interface UserMenuProps {
  profileImage?: string;
}

export default function UserMenu({ profileImage }: UserMenuProps) {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8 p-0 overflow-hidden"
        onClick={() => setIsProfileDrawerOpen(true)}
      >
        <Avatar className="h-full w-full">
          <AvatarImage
            src={profileImage || "/wizard-avatar.png"}
            alt="Profile"
          />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold">
            <Image
              src={WizardProfileImg}
              className="translate-y-[3px]"
              alt="Profile"
              width={22}
              height={44}
            />
          </AvatarFallback>
        </Avatar>
      </Button>

      <UserProfileDrawer
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
      />
    </>
  );
}
