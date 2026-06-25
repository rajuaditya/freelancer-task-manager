import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useAppStore } from './store/appStore'
import { supabase } from './lib/supabase'
import { registerServiceWorker, requestNotificationPermission } from './utils/notifications'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './components/ui/LoadingScreen'
import NotificationPopup from './components/notifications/NotificationPopup'

// Lazy loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { darkMode } = useAppStore()
  const { setUser, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', darkMode)
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => {
    // Init auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    // Init PWA
    registerServiceWorker()
    requestNotificationPermission()

    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:id" element={<ClientProfilePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>

        <NotificationPopup />

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'hot-toast',
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
