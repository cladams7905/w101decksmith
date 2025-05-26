"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Crown,
  CreditCard,
  Edit,
  LogOut,
  Mail,
  Save,
  Settings,
  User,
  UserCircle,
  ChevronRight
} from "lucide-react";
import { UpgradeMembershipModal } from "@/components/spell-sidebar/upgrade-membership-modal";

interface UserProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({
  open,
  onOpenChange
}: UserProfileDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("WizardMaster99");
  const [email, setEmail] = useState("wizard@example.com");
  const [bio, setBio] = useState(
    "Level 150 Fire Wizard. PvP enthusiast and deck builder."
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="text-left">
          <SheetTitle>User Profile</SheetTitle>
          <SheetDescription>
            View and manage your profile information
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-4">
            <div className="flex flex-col items-center gradient-special py-8 space-y-4 rounded-xl">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src="/wizard-avatar.png" alt="Profile" />
                  <AvatarFallback className="bg-purple-700 text-xl">
                    W
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium">{username}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="bg-red-900/30 text-red-100"
                  >
                    Fire
                  </Badge>
                  <Badge variant="outline">Level 150</Badge>
                  <Badge className="bg-purple-700">Free</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Profile Information</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-950/30 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">
                    Decks Created
                  </div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="bg-blue-950/30 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">
                    Deck Views
                  </div>
                  <div className="text-2xl font-bold">487</div>
                </div>
                <div className="bg-blue-950/30 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">
                    Likes Received
                  </div>
                  <div className="text-2xl font-bold">56</div>
                </div>
                <div className="bg-blue-950/30 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Comments</div>
                  <div className="text-2xl font-bold">23</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6 mt-4">
            <div className="bg-linear-to-br from-blue-950/50 to-black/50 border border-blue-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
                <Badge variant="outline">Free</Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-6">✓</div>
                  <div>Create up to 5 decks</div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6">✓</div>
                  <div>Basic spell library</div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6">✓</div>
                  <div>Deck statistics</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-6">✗</div>
                  <div>AI deck recommendations</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-6">✗</div>
                  <div>Advanced statistics</div>
                </div>
              </div>

              <div className="mt-4">
                <UpgradeMembershipModal
                  trigger={
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Payment Methods</h4>
              <div className="bg-blue-950/30 p-3 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm">No payment methods</div>
                    <div className="text-xs text-muted-foreground">
                      Add a payment method to upgrade
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Billing History</h4>
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No billing history available</p>
                <p className="text-xs">
                  Upgrade to premium to view your billing history
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Account Settings</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-blue-950/30 cursor-pointer">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div className="text-sm">Change Username</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md hover:bg-blue-950/30 cursor-pointer">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div className="text-sm">Update Email</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md hover:bg-blue-950/30 cursor-pointer">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div className="text-sm">Notification Settings</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-destructive">
                Danger Zone
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-destructive/10 cursor-pointer">
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-3 text-destructive" />
                    <div className="text-sm">Sign Out</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md hover:bg-destructive/10 cursor-pointer">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-destructive" />
                    <div className="text-sm">Delete Account</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <div className="text-xs text-muted-foreground text-center w-full">
            Wizard101 Deck Builder v1.0.0
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
