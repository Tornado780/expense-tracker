'use client'
import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'

export default function AlertBell() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts')
      setAlerts(res.data.alerts)
      setUnreadCount(res.data.unreadCount)
    } catch {}
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/alerts/read-all')
      fetchAlerts()
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`)
      fetchAlerts()
    } catch {}
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead() }}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-14 sm:top-10 w-auto sm:w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Alerts</p>
            {alerts.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-500 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No alerts yet</p>
            ) : (
              alerts.map(a => (
                <div
                  key={a.id}
                  onClick={() => markRead(a.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!a.isRead ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      {a.type === 'EXCEEDED' ? '🚨' : '⚠️'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(a.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!a.isRead && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}