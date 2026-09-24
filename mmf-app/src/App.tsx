import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AgeGate } from './components/AgeGate'
import { isAgeVerified, setAgeVerified } from './lib/storage'
import { HomePage } from './pages/HomePage'
import { PlayPage } from './pages/PlayPage'
import { SetupPage } from './pages/SetupPage'

export default function App() {
  const [verified, setVerified] = useState(() => isAgeVerified())

  if (!verified) {
    return (
      <AgeGate
        onConfirm={() => {
          setAgeVerified()
          setVerified(true)
        }}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
