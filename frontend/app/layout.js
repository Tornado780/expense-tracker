import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'SpendSmart — AI Expense Tracker',
  description: 'Track expenses with AI-powered categorization',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}