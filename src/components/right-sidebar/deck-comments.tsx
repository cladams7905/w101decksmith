"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, MoreHorizontal, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    school: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
  showReplyInput?: boolean;
}

export default function DeckComments() {
  // Mock data for comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "IceWizard99",
        avatar: "",
        school: "ice"
      },
      content:
        "Great deck! I've been using something similar but with more shields. Have you considered adding Tower Shield?",
      timestamp: "2 hours ago",
      likes: 12,
      liked: true,
      replies: [
        {
          id: "1-1",
          author: {
            name: "FireMaster",
            avatar: "",
            school: "fire"
          },
          content: "I agree, more shields would help against Storm wizards.",
          timestamp: "1 hour ago",
          likes: 3,
          liked: false
        }
      ],
      showReplyInput: false
    },
    {
      id: "2",
      author: {
        name: "StormMaster",
        avatar: "",
        school: "storm"
      },
      content:
        "I think this deck has too many high pip spells. You might struggle in the early rounds. Try adding more 1-2 pip utility spells.",
      timestamp: "1 day ago",
      likes: 8,
      liked: false,
      replies: [],
      showReplyInput: false
    },
    {
      id: "3",
      author: {
        name: "BalanceWiz",
        avatar: "",
        school: "balance"
      },
      content:
        "Nice strategy with the feints! I've been trying to incorporate more balance spells into my fire deck too.",
      timestamp: "3 days ago",
      likes: 5,
      liked: false,
      replies: [],
      showReplyInput: false
    }
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const handleLikeComment = (
    commentId: string,
    isReply = false,
    parentId?: string
  ) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                    liked: !reply.liked
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        })
      );
    } else {
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
              liked: !comment.liked
            };
          }
          return comment;
        })
      );
    }
  };

  const toggleReplyInput = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            showReplyInput: !comment.showReplyInput
          };
        }
        return comment;
      })
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: {
          name: "You",
          avatar: "",
          school: "fire"
        },
        content: newComment,
        timestamp: "Just now",
        likes: 0,
        liked: false,
        replies: [],
        showReplyInput: false
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    }
  };

  const handleAddReply = (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (replyText && replyText.trim()) {
      const newReply: Comment = {
        id: `${commentId}-${Date.now()}`,
        author: {
          name: "You",
          avatar: "",
          school: "fire"
        },
        content: replyText,
        timestamp: "Just now",
        likes: 0,
        liked: false
      };

      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
              showReplyInput: false
            };
          }
          return comment;
        })
      );

      // Clear the reply text for this comment
      setReplyTexts({
        ...replyTexts,
        [commentId]: ""
      });
    }
  };

  const handleReplyTextChange = (commentId: string, text: string) => {
    setReplyTexts({
      ...replyTexts,
      [commentId]: text
    });
  };

  const getSchoolColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      fire: "red",
      ice: "blue",
      storm: "purple",
      life: "green",
      death: "gray",
      myth: "yellow",
      balance: "orange"
    };
    return schoolColors[school] || "purple";
  };

  const getSchoolInitial = (school: string) => {
    return school.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-blue-900/30">
        <div className="flex flex-col items-center justify-between mb-4 gap-2">
          <h2 className="text-lg font-bold">Reviews & Comments</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="text-sm">42</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">128</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{comments.length}</span>
            </div>
          </div>
        </div>

        <Textarea
          placeholder="Add your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none bg-blue-950/20 border-blue-900/30"
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment on this deck!</p>
          </div>
        ) : (
          <div className="divide-y divide-blue-900/30">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={comment.author.name}
                    />
                    <AvatarFallback
                      className={`bg-${getSchoolColor(
                        comment.author.school
                      )}-700`}
                    >
                      {getSchoolInitial(comment.author.school)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Report</DropdownMenuItem>
                          {comment.author.name === "You" && (
                            <>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${
                            comment.liked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => toggleReplyInput(comment.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply input */}
                    {comment.showReplyInput && (
                      <div className="mt-3">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyTexts[comment.id] || ""}
                          onChange={(e) =>
                            handleReplyTextChange(comment.id, e.target.value)
                          }
                          className="resize-none text-sm bg-blue-950/20 border-blue-900/30 min-h-[60px]"
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleReplyInput(comment.id)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyTexts[comment.id]?.trim()}
                            className="h-7 text-xs"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-900/30 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="pt-3">
                            <div className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    reply.author.avatar || "/placeholder.svg"
                                  }
                                  alt={reply.author.name}
                                />
                                <AvatarFallback
                                  className={`bg-${getSchoolColor(
                                    reply.author.school
                                  )}-700 text-xs`}
                                >
                                  {getSchoolInitial(reply.author.school)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs">
                                      {reply.author.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {reply.timestamp}
                                    </span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        Report
                                      </DropdownMenuItem>
                                      {reply.author.name === "You" && (
                                        <>
                                          <DropdownMenuItem>
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-500">
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="text-xs mt-1">{reply.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px]"
                                    onClick={() =>
                                      handleLikeComment(
                                        reply.id,
                                        true,
                                        comment.id
                                      )
                                    }
                                  >
                                    <Heart
                                      className={`h-3 w-3 mr-1 ${
                                        reply.liked
                                          ? "fill-red-500 text-red-500"
                                          : ""
                                      }`}
                                    />
                                    {reply.likes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
