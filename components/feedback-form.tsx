"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SentimentSelector } from "@/components/sentiment-selector"
import { TeamMemberSelector } from "@/components/team-member-selector"
import { AlertCircle } from "lucide-react"
import type { User } from "@/services/api"

interface FeedbackFormProps {
  teamMembers: User[]
  onSubmit: (feedback: {
    employee_id: number
    strengths: string
    areas_to_improve: string
    sentiment: "positive" | "neutral" | "negative"
  }) => Promise<void>
  onCancel: () => void
}

export function FeedbackForm({ teamMembers, onSubmit, onCancel }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    employee_id: "",
    strengths: "",
    areas_to_improve: "",
    sentiment: "" as "positive" | "neutral" | "negative" | "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate form
    if (!formData.employee_id) {
      setError("Please select a team member")
      setLoading(false)
      return
    }

    if (!formData.strengths.trim()) {
      setError("Please provide strengths feedback")
      setLoading(false)
      return
    }

    if (!formData.areas_to_improve.trim()) {
      setError("Please provide areas to improve feedback")
      setLoading(false)
      return
    }

    if (!formData.sentiment) {
      setError("Please select a sentiment")
      setLoading(false)
      return
    }

    if (formData.strengths.trim().length < 10) {
      setError("Strengths feedback must be at least 10 characters")
      setLoading(false)
      return
    }

    if (formData.areas_to_improve.trim().length < 10) {
      setError("Areas to improve feedback must be at least 10 characters")
      setLoading(false)
      return
    }

    try {
      console.log("Submitting feedback:", formData)
      await onSubmit({
        employee_id: Number.parseInt(formData.employee_id),
        strengths: formData.strengths.trim(),
        areas_to_improve: formData.areas_to_improve.trim(),
        sentiment: formData.sentiment as "positive" | "neutral" | "negative",
      })

      // Reset form on success
      setFormData({
        employee_id: "",
        strengths: "",
        areas_to_improve: "",
        sentiment: "",
      })
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      setError(error.message || "Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.employee_id && formData.strengths && formData.areas_to_improve && formData.sentiment

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>Provide structured feedback for your team member</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="employee">Team Member</Label>
            <TeamMemberSelector
              teamMembers={teamMembers}
              value={formData.employee_id}
              onChange={(value) => setFormData((prev) => ({ ...prev, employee_id: value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              value={formData.strengths}
              onChange={(e) => setFormData((prev) => ({ ...prev, strengths: e.target.value }))}
              placeholder="What are this person's key strengths? What did they do well?"
              rows={4}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Minimum 10 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="areas_to_improve">Areas to Improve</Label>
            <Textarea
              id="areas_to_improve"
              value={formData.areas_to_improve}
              onChange={(e) => setFormData((prev) => ({ ...prev, areas_to_improve: e.target.value }))}
              placeholder="What areas could they focus on for improvement? Be constructive and specific."
              rows={4}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Minimum 10 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sentiment">Overall Sentiment</Label>
            <SentimentSelector
              value={formData.sentiment as "positive" | "neutral" | "negative"}
              onChange={(sentiment) => setFormData((prev) => ({ ...prev, sentiment }))}
              disabled={loading}
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={!isFormValid || loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
