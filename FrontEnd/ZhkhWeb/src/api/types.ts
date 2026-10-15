// Типы повторяют то, что отдаёт ваш C#-API (имена полей в camelCase).

export type Role = 'citizen' | 'worker' | 'admin'

export type RequestStatus = 'New' | 'Assigned' | 'InProgress' | 'Completed' | 'Rejected'
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Emergency'
export type RequestComplexity = 'Simple' | 'Medium' | 'Complex'
export type Specialization =
  | 'General'
  | 'Plumber'
  | 'Electrician'
  | 'Carpenter'
  | 'Painter'
  | 'Cleaner'
  | 'Janitor'
  | 'Roofer'
  | 'Locksmith'

export interface User {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string | null
  phone: string
  role: Role
  specialization?: Specialization | null
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ServiceRequest {
  id: string
  createdAt: string
  doneAt: string | null
  title: string
  description: string
  address: string
  status: RequestStatus
  priority: RequestPriority
  complexity: RequestComplexity
  specialization: Specialization
  authorId: string | null
  assignedWorkerId: string | null
  needsReview?: boolean // пока не приходит из API, добавим на бэкенде позже
}
