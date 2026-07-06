import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from './store/useStore'
import useAuth from './hooks/useAuth'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Portal from './pages/Portal'
import NotFound from './pages/NotFound'

// ── Page transition wrapper ───────────────────────────────────────────────────
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

// ── Protected route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, profile } = useStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Admin trying to access portal is fine; member trying to access dashboard is not
    if (requiredRole === 'admin' && profile?.role !== 'admin') {
      return <Navigate to="/portal" replace />
    }
  }

  return children
}

// ── Auth initializer ──────────────────────────────────────────────────────────
function AuthInit() {
  useAuth() // subscribes to auth state changes
  return null
}

// ── Animated routes ───────────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/registro"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Portal />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
