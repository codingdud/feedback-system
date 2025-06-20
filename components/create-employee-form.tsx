"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"

interface Employee {
  id: number
  username: string
  role: "manager" | "employee"
  manager_id?: number
}

interface CreateEmployeeData {
  username: string
  email: string
  password: string
  confirmPassword: string
  manager_id?: number
}

interface CreateEmployeeFormProps {
  onSubmit: (employeeData: CreateEmployeeData) => Promise<void>
  onCancel: () => void
  managers?: Employee[]
  currentUser?: Employee
  isManager?: boolean
}

export function CreateEmployeeForm({
  onSubmit,
  onCancel,
  managers = [],
  currentUser,
  isManager = false,
}: CreateEmployeeFormProps) {
  const [formData, setFormData] = useState<CreateEmployeeData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    manager_id: isManager ? currentUser?.id : undefined,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Manager validation (for admin/HR creating accounts)
    if (!isManager && !formData.manager_id) {
      newErrors.manager_id = "Please select a manager"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await onSubmit(formData)
      setSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          manager_id: isManager ? currentUser?.id : undefined,
        })
        setSuccess(false)
      }, 2000)
    } catch (error: any) {
      setErrors({
        submit: error.message || "Failed to create employee account. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateEmployeeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">Account Created Successfully!</h3>
            <p className="text-gray-600">
              The employee account has been created and they can now log in with their credentials.
            </p>
            <Button onClick={onCancel} className="w-full">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Create Employee Account</span>
        </CardTitle>
        <CardDescription>
          {isManager ? "Add a new team member to your team" : "Create a new employee account and assign to a manager"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>Username</span>
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Enter username"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>Confirm Password</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Confirm password"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {!isManager && managers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="manager">Assign Manager</Label>
              <Select
                value={formData.manager_id?.toString() || ""}
                onValueChange={(value) => handleInputChange("manager_id", value)}
              >
                <SelectTrigger className={errors.manager_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      {manager.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.manager_id && <p className="text-sm text-red-600">{errors.manager_id}</p>}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
