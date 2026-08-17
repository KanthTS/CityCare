import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🤖', title: 'AI Issue Detection', desc: 'Upload a photo and CivicFix instantly classifies the issue, severity and the right department.' },
  { icon: '📍', title: 'Geolocation Intelligence', desc: 'GPS-tagged reports plotted on a live map so affected areas are never lost or overlooked.' },
  { icon: '🛠️', title: 'Safe Self-Fix Guidance', desc: 'Safe, minor issues come with step-by-step guidance. Dangerous ones are always routed to municipal crews.' },
  { icon: '🔁', title: 'Duplicate Detection', desc: 'Multiple reports of the same pothole become one consolidated municipal task — not fifteen.' },
  { icon: '✅', title: 'Citizen Verification', desc: 'Workers can\'t just mark it done — citizens confirm the fix before a complaint truly closes.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Admins track resolution time, hotspots and worker performance with real dashboards.' },
]

const STEPS = [
  'Report an Issue',
  'AI Analysis',
  'Self-Fix or Municipal Assignment',
  'Worker Resolves It',
  'Citizen Verifies',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">C</div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">CivicFix</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 text-center sm:pt-20">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
          AI-Powered Civic Issue Management
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Report it. AI classifies it.<br className="hidden sm:block" /> The city fixes it.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          CivicFix connects citizens with municipal authorities — intelligently classifying problems,
          prioritizing by severity, routing to the right department, and tracking every complaint
          through to a citizen-verified resolution.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Report an Issue
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {step}
                </div>
                {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-700 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Civic problems shouldn't sit in an inbox.</h2>
          <p className="mt-3 text-brand-100">Join CivicFix and help make your community's infrastructure visible, tracked, and fixed.</p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-400">
        CivicFix — AI-Powered Civic Issue Management Platform
      </footer>
    </div>
  )
}
