"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateEmployeeForm } from "@/components/create-employee-form"
import { UserPlus, Users, Mail, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: number
  username: string
  email?: string
  role: "manager" | "employee"
  manager_id?: number
  is_active: boolean
  created_at: string
}

interface CreateEmployeeData {
  username: string
  email: string
  password: string
  confirmPassword: string
  manager_id?: number
}

interface EmployeeManagementProps {
  currentUser: User
  teamMembers: User[]
  onCreateEmployee: (employeeData: CreateEmployeeData) => Promise<void>
  onUpdateEmployee?: (employeeId: number, updates: Partial<User>) => Promise<void>
  onDeactivateEmployee?: (employeeId: number) => Promise<void>
}

export function EmployeeManagement({
  currentUser,
  teamMembers,
  onCreateEmployee,
  onUpdateEmployee,
  onDeactivateEmployee,
}: EmployeeManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreateEmployee = async (employeeData: CreateEmployeeData) => {
    setLoading(true)
    try {
      await onCreateEmployee(employeeData)
      setShowCreateForm(false)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <CreateEmployeeForm
          onSubmit={handleCreateEmployee}
          onCancel={() => setShowCreateForm(false)}
          currentUser={currentUser}
          isManager={true}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
            <p className="text-gray-600 mt-2">Manage your team members and their accounts</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter((member) => member.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {teamMembers.filter((member) => !member.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team member accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-4">Start building your team by adding your first team member.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{member.username}</h3>
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        {member.email && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {formatDate(member.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (onUpdateEmployee) {
                              // For demo, just toggle some property
                              console.log("Edit employee:", member.id)
                            }
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onDeactivateEmployee) {
                              onDeactivateEmployee(member.id)
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {member.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
