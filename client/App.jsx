import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '@/app/page'
import DashboardPage from '@/app/dashboard/page'
import JobsPage from '@/app/jobs/page'
import JobDetailPage from '@/app/jobs/job-detail-page'
import CreateJobPage from '@/app/jobs/new/page'
import LoginPage from '@/app/login/page'
import SignUpPage from '@/app/signup/page'
import PaymentSuccessPage from '@/app/payment/success/page'
import PaymentCancelPage from '@/app/payment/cancel/page'
import { GuestOnly, RequireAuth } from '@/components/auth/require-auth'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route
        path="/jobs/new"
        element={
          <RequireAuth allowedRoles={['CLIENT']}>
            <CreateJobPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <SignUpPage />
          </GuestOnly>
        }
      />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
