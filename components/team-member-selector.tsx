"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

interface TeamMember {
  id: number
  username: string
  role: "manager" | "employee"
  manager_id?: number
}

interface TeamMemberSelectorProps {
  teamMembers: TeamMember[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TeamMemberSelector({ teamMembers, value, onChange, disabled = false }: TeamMemberSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <SelectValue placeholder="Select a team member" />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {teamMembers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No team members found</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <SelectItem
              key={member.id}
              value={member.id.toString()}
              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <div className="flex items-center space-x-3 py-1">
                <div className="flex-shrink-0">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
