import { api } from './client'
import type { ServiceRequest } from './types'

// Лимиты такие же, как в RequestController на сервере
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

// ---------- Житель ----------

export const fetchMyRequests = () => api.get<ServiceRequest[]>('/api/request/get_requests')

export const createRequest = (data: CreateRequestData) =>
  api.post<ServiceRequest>('/api/request/create_request', data)

// ---------- Сотрудник ----------

// Заявки, закреплённые за текущим работником (назначенные, в работе, выполненные)
export const fetchWorkerRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/worker')

// Заявки по специальности работника (для вкладки «Свободные заявки»)
export const fetchWorkerSpecRequests = () =>
  api.get<ServiceRequest[]>('/api/request/get_requests/worker_spec')

// Взять заявку в работу (Assigned / New -> InProgress)
export const startExecutionRequest = (requestId: string) =>
  api.post<ActionMessage>('/api/worker/execution_request', { requestId })

// Завершить выполнение заявки (InProgress -> Completed)
export const completeRequest = (requestId: string) =>
  api.post<ActionMessage>('/api/worker/taking_request', { requestId })

// Заготовка на будущее: отправить заявку на проверку менеджеру/диспетчеру
export const sendRequestToReview = (requestId: string) =>
  api.post<ActionMessage>('/api/worker/review_request', { requestId })