import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AgeGate } from './components/AgeGate'
import { isAgeVerified, setAgeVerified } from './lib/storage'
import { BrowsePage } from './pages/BrowsePage'
import { LandingPage } from './pages/LandingPage'
import { MatchesPage } from './pages/MatchesPage'
import { MePage } from './pages/MePage'
import { MessagesPage } from './pages/MessagesPage'
import { ProfilePage } from './pages/ProfilePage'

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
      <Route path="/" element={<LandingPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/me" element={<MePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
