import { create } from 'zustand'
import apiClient from '@/app/lib/axiosConfig'

export interface AuthState {
  userId: string
  setUserId: (userId: string) => void
  clearUserId: () => void
  token: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: '',
  setUserId: (userId: string) => set({ userId }),
  clearUserId: () => set({ userId: '' }),
  token: null,
  setToken: (token: string | null) => set({ token }),
}))

export const getStoredUserId = async (): Promise<string> => {
  const store = useAuthStore.getState()
  if (store.userId) return store.userId
  try {
    const response = await apiClient.get('/user/userId')
    const userId = response.data
    store.setUserId(userId)
    return userId
  } catch (error) {
    console.error("Failed to fetch user ID:", error)
    store.clearUserId()
    throw error
  }
}
