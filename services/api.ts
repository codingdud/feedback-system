import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token (exclude login endpoint)
apiClient.interceptors.request.use((config) => {
  // Don't add auth header for login requests
  if (config.url?.includes("/auth/login")) {
    return config
  }

  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login request
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      // Token expired or invalid
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Types
export interface User {
  id: number
  username: string
  email?: string
  role: "manager" | "employee"
  manager_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role: "employee"
}

export interface UpdateUserData {
  username?: string
  email?: string
  manager_id?: number
}

export interface Feedback {
  id: number
  employee_id: number
  manager_id: number
  strengths: string
  areas_to_improve: string
  sentiment: "positive" | "neutral" | "negative"
  is_acknowledged: boolean
  created_at: string
  updated_at: string
}

export interface FeedbackWithDetails extends Feedback {
  employee_name: string
  manager_name: string
}

export interface CreateFeedbackData {
  employee_id: number
  strengths: string
  areas_to_improve: string
  sentiment: "positive" | "neutral" | "negative"
}

export interface UpdateFeedbackData {
  strengths?: string
  areas_to_improve?: string
  sentiment?: "positive" | "neutral" | "negative"
}

export interface DashboardStats {
  total_feedback: number
  positive_feedback: number
  neutral_feedback: number
  negative_feedback: number
  acknowledged_feedback: number
  team_size?: number
  active_team_size?: number
}

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

// API Functions

// Authentication
export const authAPI = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me")
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
  },
}

// Users
export const usersAPI = {
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post("/users/", data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/users/me")
    return response.data
  },

  getMyTeam: async (): Promise<User[]> => {
    const response = await apiClient.get("/users/my-team")
    return response.data
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  updateUser: async (userId: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}`, data)
    return response.data
  },

  toggleUserStatus: async (userId: number): Promise<User> => {
    const response = await apiClient.post(`/users/${userId}/toggle-status`)
    return response.data
  },

  getTeamStats: async (managerId: number): Promise<any> => {
    const response = await apiClient.get(`/users/team-stats/${managerId}`)
    return response.data
  },
}

// Feedback
export const feedbackAPI = {
  createFeedback: async (data: CreateFeedbackData): Promise<Feedback> => {
    const response = await apiClient.post("/feedback/", data)
    return response.data
  },

  getMyReceivedFeedback: async (): Promise<FeedbackWithDetails[]> => {
    const response = await apiClient.get("/feedback/my-received")
    return response.data
  },

  getTeamMemberFeedback: async (employeeId: number): Promise<FeedbackWithDetails[]> => {
    const response = await apiClient.get(`/feedback/team-member/${employeeId}`)
    return response.data
  },

  getMyGivenFeedback: async (): Promise<FeedbackWithDetails[]> => {
    const response = await apiClient.get("/feedback/my-given")
    return response.data
  },

  updateFeedback: async (feedbackId: number, data: UpdateFeedbackData): Promise<Feedback> => {
    const response = await apiClient.put(`/feedback/${feedbackId}`, data)
    return response.data
  },

  acknowledgeFeedback: async (feedbackId: number): Promise<Feedback> => {
    const response = await apiClient.post(`/feedback/${feedbackId}/acknowledge`)
    return response.data
  },
}

// Dashboard
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard/stats")
    return response.data
  },

  getTeamOverview: async (): Promise<any> => {
    const response = await apiClient.get("/dashboard/team-overview")
    return response.data
  },
}

export default apiClient
