"use client";

import type React from "react";
import { useState } from "react";

import { Check, Crown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface UpgradeMembershipModalProps {
  trigger?: React.ReactNode;
}

export function UpgradeMembershipModal({
  trigger
}: UpgradeMembershipModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {trigger || (
          <Button variant="outline_primary" className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Membership
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock powerful features to enhance your deck building experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Free Plan */}
          <div className="border rounded-lg p-4 bg-linear-to-b from-blue-950/50 to-black/50">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Free Plan</h3>
              <p className="text-sm text-muted-foreground">Current Plan</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <FeatureItem available={true}>Create up to 5 decks</FeatureItem>
              <FeatureItem available={true}>Basic spell library</FeatureItem>
              <FeatureItem available={true}>Deck statistics</FeatureItem>
              <FeatureItem available={false}>
                AI deck recommendations
              </FeatureItem>
              <FeatureItem available={false}>Advanced statistics</FeatureItem>
              <FeatureItem available={false}>Unlimited decks</FeatureItem>
              <FeatureItem available={false}>Export to game</FeatureItem>
              <FeatureItem available={false}>Premium spell effects</FeatureItem>
            </div>
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold">Free</p>
              <p className="text-sm text-muted-foreground">Forever</p>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border border-purple-500 rounded-lg p-4 bg-linear-to-b from-purple-950/50 to-black/50 relative">
            <Badge className="absolute -top-2 -right-2 bg-linear-to-r from-purple-600 to-purple-800">
              RECOMMENDED
            </Badge>
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Premium Plan</h3>
              <p className="text-sm text-purple-400">Unlock All Features</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <FeatureItem available={true} premium={true}>
                Unlimited decks
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Complete spell library
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Advanced deck statistics
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                AI deck recommendations
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Meta analysis
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Export decks to game
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Premium spell effects
              </FeatureItem>
              <FeatureItem available={true} premium={true}>
                Priority support
              </FeatureItem>
            </div>
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold">
                $4.99<span className="text-sm font-normal">/month</span>
              </p>
              <p className="text-sm text-purple-400">or $49.99/year</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:flex-1">
            Learn More
          </Button>
          <Button className="sm:flex-1 bg-purple-600 hover:bg-purple-700">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FeatureItemProps {
  available: boolean;
  children: React.ReactNode;
  premium?: boolean;
}

function FeatureItem({
  available,
  children,
  premium = false
}: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2">
      {available ? (
        <Check
          className={`h-4 w-4 ${
            premium ? "text-purple-400" : "text-green-500"
          }`}
        />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span
        className={`text-sm ${
          !available
            ? "text-muted-foreground"
            : premium
            ? "text-purple-100"
            : ""
        }`}
      >
        {children}
      </span>
    </div>
  );
}
