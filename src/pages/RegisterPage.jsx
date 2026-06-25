import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password, fullName }) => {
    try {
      await registerUser(email, password, fullName)
      toast.success('Account created! Check your email to confirm.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-lg mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Start managing clients like a pro</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className={`input-field pl-10 ${errors.fullName ? 'border-red-500/50' : ''}`}
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary justify-center py-3 text-base font-semibold"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-lg mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Reset Password</h1>
          <p className="text-slate-400 mt-1 text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Email Sent!</h3>
              <p className="text-slate-400 text-sm">Check your inbox for the password reset link.</p>
              <Link to="/login" className="mt-4 inline-block text-brand-400 hover:text-brand-300 text-sm font-medium">
                Back to Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full btn-primary justify-center py-3">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-slate-400 text-sm hover:text-white transition-colors">← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
