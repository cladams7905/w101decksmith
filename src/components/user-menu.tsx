"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserProfileDrawer } from "@/components/user-profile-drawer"

interface UserMenuProps {
  profileImage?: string
}

export default function UserMenu({ profileImage }: UserMenuProps) {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8 p-0 overflow-hidden"
        onClick={() => setIsProfileDrawerOpen(true)}
      >
        <Avatar className="h-full w-full">
          <AvatarImage src={profileImage || "/wizard-avatar.png"} alt="Profile" />
          <AvatarFallback className="bg-purple-700 text-white font-bold">W</AvatarFallback>
        </Avatar>
      </Button>

      <UserProfileDrawer open={isProfileDrawerOpen} onOpenChange={setIsProfileDrawerOpen} />
    </>
  )
}
