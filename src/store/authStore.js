import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),

      login: async (email, password) => {
        set({ isLoading: true })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        set({ isLoading: false })
        if (error) throw error
        set({ user: data.user, isAuthenticated: true })
        get().fetchProfile(data.user.id)
        return data
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true })
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } }
        })
        set({ isLoading: false })
        if (error) throw error
        return data
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, isAuthenticated: false })
      },

      fetchProfile: async (userId) => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (data) set({ profile: data })
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
        if (error) throw error
        set({ profile: data })
        return data
      },

      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
      },
    }),
    {
      name: 'ftm-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
