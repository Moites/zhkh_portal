import { api } from './client'
import type {
  RequestComplexity,
  RequestPriority,
  RequestStatus,
  ServiceRequest,
  Specialization,
  User,
} from './types'

export const REQUEST_LIMITS = {
  title: { min: 10, max: 150 },
  description: { min: 50, max: 800 },
  address: { min: 10, max: 200 },
} as const

export interface CreateRequestData {
  title: string
  description: string
  address: string
}

export interface ActionMessage {
  message: string
}

// Ключи TanStack Query
export const MY_REQUESTS_KEY = ['my-requests'] as const
export const WORKER_REQUESTS_KEY = ['worker-requests'] as const
export const WORKER_SPEC_REQUESTS_KEY = ['worker-spec-requests'] as const
export const ADMIN_REQUESTS_KEY = ['admin-requests'] as const
export const ADMIN_REVIEW_KEY = ['admin-review-requests'] as const
export const ADMIN_WORKERS_KEY = ['admin-workers'] as const
export const ADMIN_USERS_KEY = ['admin-users'] as const

// ---------- Житель ----------

export const fetchMyRequests = () => api.get<ServiceRequest[]>('/api/request/get_requests')

export const createRequest = (data: CreateRequestData) =>
  api.post<ServiceRequest>('/api/request/create_request', data)

// ---------- Сотрудник ----------

export const fetchWorkerRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/worker')

export const fetchWorkerSpecRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/worker_spec')

export const startExecutionRequest = (requestId: string) =>
  api.post<ActionMessage>('/api/worker/execution_request', { requestId })

export const completeRequest = (requestId: string) =>
  api.post<ActionMessage>('/api/worker/taking_request', { requestId })

// ---------- Администратор ----------

export const STATUS_ENUM: Record<RequestStatus, number> = {
  New: 0,
  Assigned: 1,
  InProgress: 2,
  Completed: 3,
  Rejected: 4,
}

export const PRIORITY_ENUM: Record<RequestPriority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Emergency: 3,
}

export const COMPLEXITY_ENUM: Record<RequestComplexity, number> = {
  Simple: 0,
  Medium: 1,
  Complex: 2,
}

export const SPECIALIZATION_ENUM: Record<Specialization, number> = {
  General: 0,
  Plumber: 1,
  Electrician: 2,
  Carpenter: 3,
  Painter: 4,
  Cleaner: 5,
  Janitor: 6,
  Roofer: 7,
  Locksmith: 8,
}

export interface ChangeInfoFormValues {
  requestId: string
  status: RequestStatus
  priority: RequestPriority
  complexity: RequestComplexity
  specialization: Specialization
}

export interface CreateWorkerFormValues {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  phone: string
  password: string
  specialization: Specialization
}

export const fetchAdminRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/admin')

export const fetchAdminReviewRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/admin_review')

export const fetchAdminWorkers = () =>
  api.get<User[]>('/api/admin/workers')

export const fetchAdminUsers = () =>
  api.get<User[]>('/api/admin/users')

export const createWorkerByAdmin = (values: CreateWorkerFormValues) =>
  api.post<ActionMessage>('/api/admin/create_worker', {
    firstName: values.firstName,
    lastName: values.lastName,
    middleName: values.middleName || null,
    dateOfBirth: values.dateOfBirth,
    phone: values.phone,
    password: values.password,
    specialization: SPECIALIZATION_ENUM[values.specialization],
  })

export const promoteToWorker = (userId: string, specialization: Specialization) =>
  api.post<ActionMessage>('/api/admin/promote_worker', {
    userId,
    specialization: SPECIALIZATION_ENUM[specialization],
  })

export const appointWorker = (requestId: string, workerId: string) =>
  api.post<ActionMessage>('/api/admin/appoint_worker', { requestId, workerId })

export const changeRequestInformation = (values: ChangeInfoFormValues) =>
  api.post<ActionMessage>('/api/admin/change_information', {
    requestId: values.requestId,
    status: STATUS_ENUM[values.status],
    priority: PRIORITY_ENUM[values.priority],
    complexity: COMPLEXITY_ENUM[values.complexity],
    specialization: SPECIALIZATION_ENUM[values.specialization],
  })