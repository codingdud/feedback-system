"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackList } from "@/components/feedback-list"
import { EmployeeManagement } from "@/components/employee-management"
import { Users, MessageSquare, TrendingUp, Plus, UserPlus, Settings, Home, AlertCircle } from "lucide-react"
import {
  usersAPI,
  feedbackAPI,
  dashboardAPI,
  type User,
  type FeedbackWithDetails,
  type DashboardStats,
} from "@/services/api"

interface CreateEmployeeData {
  username: string
  email: string
  password: string
  confirmPassword: string
  manager_id?: number
}

interface ManagerDashboardProps {
  user: User
}

export function ManagerDashboard({ user }: ManagerDashboardProps) {
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [feedback, setFeedback] = useState<FeedbackWithDetails[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [currentView, setCurrentView] = useState<"dashboard" | "feedback" | "team-management">("dashboard")
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [selectedEmployeeFeedback, setSelectedEmployeeFeedback] = useState<FeedbackWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Load team members, feedback, and stats in parallel
      const [teamData, feedbackData, statsData] = await Promise.all([
        usersAPI.getMyTeam(),
        feedbackAPI.getMyGivenFeedback(),
        dashboardAPI.getStats(),
      ])

      setTeamMembers(teamData)
      setFeedback(feedbackData)
      setStats(statsData)
    } catch (error: any) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (feedbackData: {
    employee_id: number
    strengths: string
    areas_to_improve: string
    sentiment: "positive" | "neutral" | "negative"
  }) => {
    try {
      await feedbackAPI.createFeedback(feedbackData)

      // Reload feedback data
      const updatedFeedback = await feedbackAPI.getMyGivenFeedback()
      const updatedStats = await dashboardAPI.getStats()

      setFeedback(updatedFeedback)
      setStats(updatedStats)
      setCurrentView("dashboard")
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      throw new Error(error.response?.data?.detail || "Failed to submit feedback")
    }
  }

  const handleEditFeedback = async (
    feedbackId: number,
    updates: {
      strengths: string
      areas_to_improve: string
      sentiment: "positive" | "neutral" | "negative"
    },
  ) => {
    console.log("handleEditFeedback called with:", { feedbackId, updates })
    try {
      await feedbackAPI.updateFeedback(feedbackId, updates)
      console.log("Feedback updated successfully")

      // Reload feedback data
      const updatedFeedback = await feedbackAPI.getMyGivenFeedback()
      setFeedback(updatedFeedback)

      // If viewing specific employee feedback, reload that too
      if (selectedEmployee) {
        const updatedEmployeeFeedback = await feedbackAPI.getTeamMemberFeedback(selectedEmployee.id)
        setSelectedEmployeeFeedback(updatedEmployeeFeedback)
      }

      // Reload stats
      const updatedStats = await dashboardAPI.getStats()
      setStats(updatedStats)
    } catch (error: any) {
      console.error("Error updating feedback:", error)
      throw new Error(error.response?.data?.detail || "Failed to update feedback")
    }
  }

  const handleCreateEmployee = async (employeeData: CreateEmployeeData): Promise<void> => {
    try {
      await usersAPI.createUser({
        username: employeeData.username,
        email: employeeData.email,
        password: employeeData.password,
        role: "employee",
      })

      // Reload team data
      const updatedTeam = await usersAPI.getMyTeam()
      const updatedStats = await dashboardAPI.getStats()

      setTeamMembers(updatedTeam)
      setStats(updatedStats)
    } catch (error: any) {
      console.error("Error creating employee:", error)
      throw new Error(error.response?.data?.detail || "Failed to create employee account")
    }
  }

  const handleUpdateEmployee = async (employeeId: number, updates: Partial<User>): Promise<void> => {
    try {
      await usersAPI.updateUser(employeeId, updates)

      // Reload team data
      const updatedTeam = await usersAPI.getMyTeam()
      setTeamMembers(updatedTeam)
    } catch (error: any) {
      console.error("Error updating employee:", error)
      throw new Error(error.response?.data?.detail || "Failed to update employee")
    }
  }

  const handleDeactivateEmployee = async (employeeId: number): Promise<void> => {
    try {
      await usersAPI.toggleUserStatus(employeeId)

      // Reload team data
      const updatedTeam = await usersAPI.getMyTeam()
      const updatedStats = await dashboardAPI.getStats()

      setTeamMembers(updatedTeam)
      setStats(updatedStats)
    } catch (error: any) {
      console.error("Error toggling employee status:", error)
      throw new Error(error.response?.data?.detail || "Failed to update employee status")
    }
  }

  const handleViewEmployeeFeedback = async (employee: User) => {
    try {
      setSelectedEmployee(employee)
      const employeeFeedback = await feedbackAPI.getTeamMemberFeedback(employee.id)
      setSelectedEmployeeFeedback(employeeFeedback)
    } catch (error: any) {
      console.error("Error loading employee feedback:", error)
      setError("Failed to load employee feedback")
    }
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedEmployee(null)
    setSelectedEmployeeFeedback([])
    setError("")
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  // Show error state
  if (error && currentView === "dashboard") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={loadDashboardData} className="mt-2 w-full">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Team Management View
  if (currentView === "team-management") {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Team Management</h1>
              </div>
            </div>
          </div>
        </nav>
        <EmployeeManagement
          currentUser={user}
          teamMembers={teamMembers}
          onCreateEmployee={handleCreateEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeactivateEmployee={handleDeactivateEmployee}
        />
      </div>
    )
  }

  // Feedback Form View
  if (currentView === "feedback") {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Submit New Feedback</h1>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto p-6">
          <FeedbackForm
            teamMembers={teamMembers.filter((member) => member.is_active)}
            onSubmit={handleSubmitFeedback}
            onCancel={handleBackToDashboard}
          />
        </div>
      </div>
    )
  }

  // Employee Feedback View
  if (selectedEmployee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Feedback for {selectedEmployee.username}</h1>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto p-6">
          <FeedbackList feedback={selectedEmployeeFeedback} isManager={true} onEdit={handleEditFeedback} />
        </div>
      </div>
    )
  }

  // Main Dashboard View
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Manager Dashboard</h2>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setCurrentView("team-management")}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button onClick={() => setCurrentView("feedback")}>
              <Plus className="w-4 h-4 mr-2" />
              New Feedback
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Manage your team and track feedback</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_team_size || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats.team_size || 0) - (stats.active_team_size || 0)} inactive
              </p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.positive_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acknowledgment Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_feedback > 0 ? Math.round((stats.acknowledged_feedback / stats.total_feedback) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => setCurrentView("team-management")}
            >
              <UserPlus className="w-6 h-6" />
              <span>Add Team Member</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => setCurrentView("feedback")}
            >
              <Plus className="w-6 h-6" />
              <span>Submit Feedback</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
          <CardDescription>Manage feedback for your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers
              .filter((member) => member.is_active)
              .map((member) => {
                const memberFeedback = feedback.filter((f) => f.employee_id === member.id)
                const unacknowledged = memberFeedback.filter((f) => !f.is_acknowledged).length

                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{member.username}</h3>
                      <p className="text-sm text-gray-600">
                        {memberFeedback.length} feedback entries
                        {member.email && ` • ${member.email}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unacknowledged > 0 && <Badge variant="secondary">{unacknowledged} unread</Badge>}
                      <Button variant="outline" size="sm" onClick={() => handleViewEmployeeFeedback(member)}>
                        View Feedback
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest feedback you've provided</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackList feedback={feedback.slice(0, 5)} isManager={true} onEdit={handleEditFeedback} />
        </CardContent>
      </Card>
    </div>
  )
}
