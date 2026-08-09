import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RequireEvent from './components/RequireEvent'
import LoginPage from './pages/LoginPage'
import EventPickerPage from './pages/EventPickerPage'
import ScannerPage from './pages/ScannerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventPickerPage />} />
          <Route element={<RequireEvent />}>
            <Route path="/scan" element={<ScannerPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
