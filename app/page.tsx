"use client"

import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { Send, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { ProfileImageSelector } from "@/components/profile-image-selector"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem("chatProfileImage")
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [])

  // Save profile image to localStorage when it changes
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("chatProfileImage", profileImage)
    } else {
      localStorage.removeItem("chatProfileImage")
    }
  }, [profileImage])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-lg">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="text-center text-xl font-semibold">AI Assistant</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <ProfileImageSelector currentImage={profileImage} onImageChange={setProfileImage} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-medium">Welcome to AI Chat</h3>
                <p className="text-muted-foreground">
                  Start a conversation with the AI assistant. Ask questions, get information, or just chat!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 w-full",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role !== "user" && (
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback>
                      <span className="text-xs font-semibold">AI</span>
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%] break-words whitespace-pre-wrap",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {typeof message.content === "string"
                    ? message.content
                    : message.content && typeof message.content === "object"
                      ? JSON.stringify(message.content)
                      : ""}
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    {profileImage ? (
                      <AvatarImage src={profileImage || "/placeholder.svg"} alt="Your profile" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span className="text-xs font-semibold text-white">You</span>
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarFallback>
                  <span className="text-xs font-semibold">AI</span>
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-75" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size={isMobile ? "icon" : "default"} disabled={isLoading || !input.trim()}>
              {isMobile ? (
                <Send className="h-4 w-4" />
              ) : (
                <>
                  Send
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
