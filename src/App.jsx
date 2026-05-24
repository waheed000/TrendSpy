import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProductHunt from './pages/ProductHunt.jsx'
import CityExplorer from './pages/CityExplorer.jsx'
import Trends from './pages/Trends.jsx'
import AdSpy from './pages/AdSpy.jsx'
import AIAnalyst from './pages/AIAnalyst.jsx'
import Alerts from './pages/Alerts.jsx'
import Seasonal from './pages/Seasonal.jsx'
import Profile from './pages/Profile.jsx'
import Layout from './components/Layout.jsx'
import useStore from './store/useStore.js'

function ProtectedRoute({ children }) {
  const user = useStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e3f',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout><ProductHunt /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/city-explorer"
          element={
            <ProtectedRoute>
              <Layout><CityExplorer /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trends"
          element={
            <ProtectedRoute>
              <Layout><Trends /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ad-spy"
          element={
            <ProtectedRoute>
              <Layout><AdSpy /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-analyst"
          element={
            <ProtectedRoute>
              <Layout><AIAnalyst /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout><Alerts /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seasonal"
          element={
            <ProtectedRoute>
              <Layout><Seasonal /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
