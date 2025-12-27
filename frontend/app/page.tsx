import Link from 'next/link'
import { ArrowRight, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand shadow-[0_0_10px_var(--color-brand)]"></div>
            <span className="font-bold text-lg tracking-tight">Shantivaas</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="#stats" className="hover:text-white transition">Stats</Link>
            <Link href="#about" className="hover:text-white transition">About</Link>
          </div>

          <Link
            href="/login"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Smart Rental Management</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
            Empowering Living <br />
            Through <span className="text-brand relative">
              Smart Solutions
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            From seamless rent payments to instant complaint resolution, we deliver innovative strategies that elevate your living experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group bg-brand text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 rounded-full font-bold text-lg border border-white/20 hover:bg-white/10 transition"
            >
              View Demo
            </Link>
          </div>

          {/* Hero Image / Visual */}
          <div className="mt-16 relative mx-auto max-w-4xl">
            <div className="aspect-[16/9] bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
              {/* Abstract UI representation */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                <div className="grid grid-cols-2 gap-8 w-3/4 opacity-20">
                  <div className="bg-white/10 h-32 rounded-xl"></div>
                  <div className="bg-white/10 h-32 rounded-xl"></div>
                  <div className="bg-white/10 h-32 rounded-xl col-span-2"></div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 z-20 bg-white/10 backdrop-blur border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">System Status</div>
                  <div className="font-bold text-white">100% Operational</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Rooms", value: "2000+" },
              { label: "Years Experience", value: "10+" },
              { label: "Happy Tenants", value: "800+" },
              { label: "Rent Collected", value: "₹150M+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Turning Rentals Into <br /> <span className="text-gray-500">Masterpieces</span></h2>
            <p className="text-gray-400 max-w-xl">
              We may be a compact team, but our platform knows no bounds. By staying agile and working constantly with our users, we transform rental management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative bg-[#111] rounded-3xl p-8 border border-white/5 hover:border-brand/50 transition duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition duration-500">
                <ArrowRight className="w-6 h-6 text-brand -rotate-45" />
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-black transition duration-500">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Dashboard</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real-time overview of your finances, occupancy, and maintenance requests in one centralized hub.
              </p>
            </div>

            {/* Feature 2 - Highlighted */}
            <div className="group relative bg-[#111] rounded-3xl p-8 border border-white/5 hover:border-brand/50 transition duration-500 overflow-hidden md:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand text-black text-xs font-bold mb-4">
                    NEW FEATURE
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Payment Automation</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Automated rent cycles, late fee calculations, and instant receipt generation. Never miss a payment again.
                  </p>
                  <Link href="/login" className="text-brand font-medium hover:underline">Try it now →</Link>
                </div>
                <div className="flex-1 bg-white/5 w-full h-48 rounded-xl border border-white/10 relative overflow-hidden group-hover:scale-105 transition duration-500">
                  {/* Abstract visual */}
                  <div className="absolute top-4 left-4 right-4 h-2 rounded bg-white/10"></div>
                  <div className="absolute top-8 left-4 w-1/2 h-2 rounded bg-white/10"></div>
                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-brand text-black rounded-lg text-xs font-bold">
                    Payment Received
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-[#111] rounded-3xl p-8 border border-white/5 hover:border-brand/50 transition duration-500 overflow-hidden">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-black transition duration-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Safe</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enterprise-grade security with role-based access control and encrypted data storage.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="group relative bg-[#111] rounded-3xl p-8 border border-white/5 hover:border-brand/50 transition duration-500 overflow-hidden sm:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Maintenance Requests</h3>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-black transition">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Streamlined complaint tracking system. Tenants prioritize issues, admins resolve them faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand"></div>
            <span className="font-bold text-lg">Shantivaas</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2025 Shantivaas. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
