"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { authAPI, usersAPI } from "@/services/api"

interface User {
  id: number
  username: string
  email?: string
  role: "manager" | "employee"
  manager_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Login and get token
      const loginResponse = await authAPI.login({ username, password })

      // Store token
      localStorage.setItem("authToken", loginResponse.access_token)

      // Get user details
      const user = await usersAPI.getCurrentUser()

      // Call onLogin with user data
      onLogin(user)
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.response?.status === 401) {
        setError("Invalid username or password")
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Feedback System</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <div>
                <strong>Manager:</strong> john_manager / password
              </div>
              <div>
                <strong>Manager:</strong> sarah_manager / password
              </div>
              <div>
                <strong>Employee:</strong> alice_employee / password
              </div>
              <div>
                <strong>Employee:</strong> bob_employee / password
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
