import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      darkMode: true,
      sidebarCollapsed: false,
      notifications: [],
      unreadCount: 0,
      activePopup: null,
      searchQuery: '',
      reminderAudio: null,

      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
        document.documentElement.classList.toggle('light', !next)
      },

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addNotification: (notif) => {
        const id = Date.now().toString()
        const notification = { id, ...notif, timestamp: new Date(), read: false }
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 50),
          unreadCount: s.unreadCount + 1,
          activePopup: notification,
        }))
        // Auto-dismiss popup after 8 seconds
        setTimeout(() => {
          set((s) => ({
            activePopup: s.activePopup?.id === id ? null : s.activePopup,
          }))
        }, 8000)
        return notification
      },

      dismissPopup: () => set({ activePopup: null }),

      markAllRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      markRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, s.unreadCount - 1),
      })),

      setSearchQuery: (q) => set({ searchQuery: q }),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'ftm-app',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)
