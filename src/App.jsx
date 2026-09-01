import { useState } from 'react'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'
import { clearTokens } from '@/lib/api'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rt_username')
    const token = localStorage.getItem('rt_jwt')
    return saved && token ? saved : null
  })

  const handleLogin = (username) => {
    setUser(username)
  }

  const handleLogout = () => {
    setUser(null)
    clearTokens()
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard username={user} onLogout={handleLogout} />
}

export default App
