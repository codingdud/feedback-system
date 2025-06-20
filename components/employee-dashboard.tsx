"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FeedbackList } from "@/components/feedback-list"
import { MessageSquare, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { feedbackAPI, dashboardAPI, type User, type FeedbackWithDetails, type DashboardStats } from "@/services/api"

interface EmployeeDashboardProps {
  user: User
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [feedback, setFeedback] = useState<FeedbackWithDetails[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Load feedback and stats in parallel
      const [feedbackData, statsData] = await Promise.all([
        feedbackAPI.getMyReceivedFeedback(),
        dashboardAPI.getStats(),
      ])

      setFeedback(feedbackData)
      setStats(statsData)
    } catch (error: any) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeFeedback = async (feedbackId: number) => {
    try {
      await feedbackAPI.acknowledgeFeedback(feedbackId)

      // Update local state
      setFeedback((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, is_acknowledged: true } : f)))

      // Reload stats
      const updatedStats = await dashboardAPI.getStats()
      setStats(updatedStats)
    } catch (error: any) {
      console.error("Error acknowledging feedback:", error)
      setError("Failed to acknowledge feedback. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button
              onClick={loadDashboardData}
              className="mt-2 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const unacknowledgedCount = feedback.filter((f) => !f.is_acknowledged).length

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Feedback</h2>
        <p className="text-gray-600 mt-2">Track your feedback and professional development</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.acknowledged_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unacknowledgedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.positive_feedback}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sentiment Overview */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feedback Overview</CardTitle>
            <CardDescription>Summary of your feedback sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Positive ({stats.positive_feedback})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Neutral ({stats.neutral_feedback})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Negative ({stats.negative_feedback})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unacknowledged Feedback */}
      {unacknowledgedCount > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">New Feedback Awaiting Review</CardTitle>
            <CardDescription className="text-orange-700">
              You have {unacknowledgedCount} feedback item(s) that need your acknowledgment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackList
              feedback={feedback.filter((f) => !f.is_acknowledged)}
              isManager={false}
              onAcknowledge={handleAcknowledgeFeedback}
            />
          </CardContent>
        </Card>
      )}

      {/* All Feedback Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Timeline</CardTitle>
          <CardDescription>All feedback you've received, sorted by most recent</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackList feedback={feedback} isManager={false} onAcknowledge={handleAcknowledgeFeedback} />
        </CardContent>
      </Card>
    </div>
  )
}
