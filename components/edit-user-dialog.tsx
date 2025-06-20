"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { User } from "@/services/api"

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (userId: number, updates: { username?: string; email?: string }) => Promise<void>
}

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Update form data when user changes
  useState(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    // Validate form
    if (!formData.username.trim()) {
      setError("Username is required")
      return
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const updates: { username?: string; email?: string } = {}

      if (formData.username !== user.username) {
        updates.username = formData.username.trim()
      }

      if (formData.email !== (user.email || "")) {
        updates.email = formData.email.trim() || undefined
      }

      if (Object.keys(updates).length > 0) {
        await onSave(user.id, updates)
      }

      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || "Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setError("")
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>Update the user information below. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              className="col-span-3"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="col-span-3"
              disabled={loading}
              placeholder="Optional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
