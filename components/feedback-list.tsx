"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SentimentSelector } from "@/components/sentiment-selector"
import { CheckCircle, Edit, Calendar, Save, X, AlertCircle } from "lucide-react"
import type { FeedbackWithDetails } from "@/services/api"

interface FeedbackListProps {
  feedback: FeedbackWithDetails[]
  isManager: boolean
  onEdit?: (
    feedbackId: number,
    updates: {
      strengths: string
      areas_to_improve: string
      sentiment: "positive" | "neutral" | "negative"
    },
  ) => Promise<void>
  onAcknowledge?: (feedbackId: number) => void
}

export function FeedbackList({ feedback, isManager, onEdit, onAcknowledge }: FeedbackListProps) {
  // Add this at the top of the component, right after the props destructuring
  console.log("FeedbackList props:", {
    feedbackCount: feedback.length,
    isManager,
    hasOnEdit: !!onEdit,
    hasOnAcknowledge: !!onAcknowledge,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    strengths: "",
    areas_to_improve: "",
    sentiment: "" as "positive" | "neutral" | "negative" | "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStartEdit = (item: FeedbackWithDetails) => {
    console.log("Starting edit for feedback:", item.id)
    console.log("onEdit function available:", !!onEdit)
    setEditingId(item.id)
    setEditForm({
      strengths: item.strengths,
      areas_to_improve: item.areas_to_improve,
      sentiment: item.sentiment,
    })
    setError("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({
      strengths: "",
      areas_to_improve: "",
      sentiment: "",
    })
    setError("")
  }

  const handleSaveEdit = async (feedbackId: number) => {
    if (!onEdit) return

    // Validate form
    if (!editForm.strengths.trim() || !editForm.areas_to_improve.trim() || !editForm.sentiment) {
      setError("All fields are required")
      return
    }

    if (editForm.strengths.trim().length < 10) {
      setError("Strengths must be at least 10 characters long")
      return
    }

    if (editForm.areas_to_improve.trim().length < 10) {
      setError("Areas to improve must be at least 10 characters long")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onEdit(feedbackId, {
        strengths: editForm.strengths.trim(),
        areas_to_improve: editForm.areas_to_improve.trim(),
        sentiment: editForm.sentiment as "positive" | "neutral" | "negative",
      })
      setEditingId(null)
      setEditForm({
        strengths: "",
        areas_to_improve: "",
        sentiment: "",
      })
    } catch (error: any) {
      console.error("Error updating feedback:", error)
      setError(error.message || "Failed to update feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No feedback available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card
          key={item.id}
          className={`${!item.is_acknowledged && !isManager ? "border-orange-200 bg-orange-50" : ""}`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {isManager ? `Feedback for ${item.employee_name}` : `Feedback from ${item.manager_name}`}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(item.created_at)}</span>
                  {item.created_at !== item.updated_at && (
                    <span className="text-xs">(Updated: {formatDate(item.updated_at)})</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>
                {item.is_acknowledged && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingId === item.id ? (
              // Edit Mode
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`strengths-${item.id}`}>Strengths</Label>
                  <Textarea
                    id={`strengths-${item.id}`}
                    value={editForm.strengths}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, strengths: e.target.value }))}
                    placeholder="What are this person's key strengths?"
                    rows={4}
                    disabled={loading}
                    className="bg-green-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`areas-${item.id}`}>Areas to Improve</Label>
                  <Textarea
                    id={`areas-${item.id}`}
                    value={editForm.areas_to_improve}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, areas_to_improve: e.target.value }))}
                    placeholder="What areas could they focus on for improvement?"
                    rows={4}
                    disabled={loading}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overall Sentiment</Label>
                  <SentimentSelector
                    value={editForm.sentiment as "positive" | "neutral" | "negative"}
                    onChange={(sentiment) => setEditForm((prev) => ({ ...prev, sentiment }))}
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(item.id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={loading}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{item.strengths}</p>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Areas to Improve</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{item.areas_to_improve}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">Feedback ID: #{item.id}</div>
                  <div className="flex space-x-2">
                    {isManager && onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("Edit button clicked for feedback:", item.id)
                          handleStartEdit(item)
                        }}
                        disabled={loading || editingId !== null}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {!isManager && !item.is_acknowledged && onAcknowledge && (
                      <Button
                        size="sm"
                        onClick={() => onAcknowledge(item.id)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
