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

// Ключ, под которым TanStack Query хранит список "моих заявок" (по нему же список обновляется)
export const MY_REQUESTS_KEY = ['my-requests'] as const

export const fetchMyRequests = () => api.get<ServiceRequest[]>('/api/request/get_requests')

export const createRequest = (data: CreateRequestData) =>
  api.post<ServiceRequest>('/api/request/create_request', data)
