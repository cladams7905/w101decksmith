"use client";

import type React from "react";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Facebook, Link, Share2, Twitter } from "lucide-react";
import { Deck } from "@/db/database.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ShareDeckModalProps {
  deck: Deck;
  trigger?: React.ReactNode;
}

export function ShareDeckModal({ deck, trigger }: ShareDeckModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("link");

  // Generate a shareable link for the deck
  const shareableLink = `https://wizard101-deck-builder.com/decks/${deck.id}`;

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle social media sharing
  const handleShare = (platform: string) => {
    let shareUrl = "";
    const text = `Check out my ${deck.name} deck for Wizard101!`;

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareableLink)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareableLink
        )}&quote=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="ghost">
                <Share2 />
              </Button>
            )}
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Share Deck</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Deck
          </DialogTitle>
          <DialogDescription>
            Share your &quot;{deck.name}&quot; deck with the Wizard101 community
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="gradient-special mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-${
                    deck.school || "fire"
                  }-700 flex items-center justify-center text-white font-bold`}
                >
                  {(deck.school || "fire").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{deck.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{deck.school || "Fire"}</Badge>
                    <Badge variant="outline">Level {deck.level || "150"}</Badge>
                    <Badge variant="outline">
                      {deck.spells.length}/64 cards
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            defaultValue="link"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Share Link</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shareable Link</label>
                <div className="flex gap-2">
                  <Input value={shareableLink} readOnly className="flex-1" />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your deck
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Embed Code</label>
                <div className="flex gap-2">
                  <Input
                    value={`<iframe src="${shareableLink}/embed" width="100%" height="500" frameborder="0"></iframe>`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<iframe src="${shareableLink}/embed" width="100%" height="500" frameborder="0"></iframe>`
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Embed this deck on your website or blog
                </p>
              </div>
            </TabsContent>

            <TabsContent value="social" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm">
                  Share your deck directly to social media:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 h-12"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span>Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 h-12"
                    onClick={() => handleShare("facebook")}
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span>Facebook</span>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Share Message</label>
                  <Input
                    defaultValue={`Check out my ${deck.name} deck for Wizard101!`}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Customize the message that appears with your shared deck
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            className="sm:flex-1"
            onClick={() => {
              if (activeTab === "link") {
                handleCopyLink();
              } else {
                handleShare("twitter");
              }
              setOpen(false);
            }}
          >
            {activeTab === "link" ? (
              <>
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
