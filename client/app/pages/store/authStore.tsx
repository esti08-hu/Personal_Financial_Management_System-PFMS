import { create } from 'zustand'
import apiClient from '@/app/lib/axiosConfig'

export interface AuthState {
  userId: string
  setUserId: (userId: string) => void
  clearUserId: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: '',
  setUserId: (userId: string) => set({ userId }),
  clearUserId: () => set({ userId: '' }),
}))

export const getStoredUserId = async (): Promise<string> => {
  const store = useAuthStore.getState()
  if (store.userId) return store.userId
  const response = await apiClient.get('/user/userId')
  const userId = response.data
  store.setUserId(userId)
  return userId
}
