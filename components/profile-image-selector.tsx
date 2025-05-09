"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ProfileImageSelectorProps {
  currentImage: string | null
  onImageChange: (imageUrl: string | null) => void
}

export function ProfileImageSelector({ currentImage, onImageChange }: ProfileImageSelectorProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreviewUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onImageChange(previewUrl)
    setOpen(false)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full">
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            {currentImage ? (
              <AvatarImage src={currentImage || "/placeholder.svg"} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <span className="text-xs font-semibold text-white">You</span>
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24 border-2 border-muted">
            {previewUrl ? (
              <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <User className="h-12 w-12 text-white" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            {previewUrl && (
              <Button type="button" variant="outline" onClick={handleRemove}>
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          <div className="text-xs text-muted-foreground mt-2">Supported formats: JPG, PNG, GIF (max 5MB)</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
