import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import { useSocket } from '../hooks/useSocket.jsx'

export default function Layout({ children }) {
  useSocket()

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
