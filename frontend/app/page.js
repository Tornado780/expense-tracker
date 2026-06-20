'use client'
import Link from 'next/link'

const features = [
  { icon: '🤖', title: 'AI Auto-Categorization', desc: 'Expenses are categorized instantly using a Naive Bayes ML model — no manual tagging needed.' },
  { icon: '📊', title: 'Spending Insights', desc: 'Visual dashboards show where your money goes with category breakdowns and monthly trends.' },
  { icon: '🔔', title: 'Budget Alerts', desc: 'Set monthly limits per category. Get alerted at 80% and 100% so you never overspend.' },
  { icon: '📥', title: 'CSV Export', desc: 'Download all your expenses as a CSV file anytime for your own records or tax filing.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-lg md:text-xl font-bold text-indigo-600">SpendSmart</span>
        <div className="flex gap-2 md:gap-3">
          <Link href="/login" className="btn-secondary text-xs md:text-sm px-3 md:px-4">Log in</Link>
          <Link href="/register" className="btn-primary text-xs md:text-sm px-3 md:px-4">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-16 text-center">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          AI-Powered Finance Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Know exactly where<br />
          <span className="text-indigo-600">your money goes</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-10 max-w-xl mx-auto px-2">
          SpendSmart auto-categorizes every expense using AI, tracks budgets in real time, and shows you spending trends — so you can make smarter decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Link href="/register" className="btn-primary px-8 py-3 text-base">Start for free</Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">Log in</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="card flex gap-4">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}