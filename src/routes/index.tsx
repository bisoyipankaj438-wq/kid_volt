import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-hidden font-sans">
      {/* Top nav */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <img src="/kidvolt-logo.png" alt="KidVolt Logo" className="w-8 h-8 animate-bolt" />
          <span>KidVolt</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/parent"
            className="text-sm font-semibold text-gray-400 hover:text-white transition"
          >
            Parent Login
          </Link>
          <Link
            to="/kid"
            className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Kids App →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold mb-8 backdrop-blur-md animate-fade-in-up">
          🚀 THE ULTIMATE FINTECH APP FOR GEN-Z
        </span>

        <h1
          className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tighter animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Real Money.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-purple-400 to-[var(--primary)] bg-[length:200%_auto] animate-gradient">
            Gamified.
          </span>
        </h1>

        <p
          className="mt-8 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Give your kids a Debit Card, teach them Fractional Investing, and pay them for chores. All
          while they play, learn, and earn.
        </p>

        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            to="/parent"
            className="w-full sm:w-auto rounded-full bg-[var(--primary)] text-black px-8 py-4 font-black text-lg hover:scale-105 transition shadow-[0_0_30px_rgba(var(--primary),0.4)]"
          >
            Get Started as Parent
          </Link>
          <Link
            to="/kid"
            className="w-full sm:w-auto rounded-full bg-white/10 border border-white/20 text-white px-8 py-4 font-bold text-lg hover:bg-white/20 transition backdrop-blur-md"
          >
            Open Kid/Teen View
          </Link>
        </div>

        {/* Floating elements */}
        <div className="absolute left-10 top-40 animate-float hidden md:block">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl rotate-12 border border-white/20">
            💸
          </div>
        </div>
        <div
          className="absolute right-10 top-60 animate-float hidden md:block"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl -rotate-12 border border-white/20">
            📈
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Everything they need to build wealth.
          </h2>
          <p className="text-xl text-gray-400">
            Not just an allowance app. A complete financial toolkit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              e: "📷",
              t: "Scan & Pay (UPI)",
              d: "Kids can scan any store QR code to pay instantly from their spendable balance.",
              c: "from-blue-500 to-cyan-500",
            },
            {
              e: "📈",
              t: "Fractional Investing",
              d: "Buy real pieces of Apple, Tesla, or Amazon for as little as ₹10. Learn the markets.",
              c: "from-purple-500 to-pink-500",
            },
            {
              e: "💳",
              t: "Custom Debit Card",
              d: "A physical card tied to their account. Parents set strict weekly spending limits.",
              c: "from-orange-500 to-red-500",
            },
            {
              e: "📸",
              t: "Photo-Proof Chores",
              d: "Assign tasks. Kids upload a photo to prove it's done before getting paid.",
              c: "from-green-500 to-emerald-500",
            },
          ].map((f, i) => (
            <div
              key={f.t}
              className="group relative rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.c} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}
              ></div>
              <div className="text-5xl mb-6 relative z-10">{f.e}</div>
              <h3 className="font-bold text-xl mb-3 relative z-10">{f.t}</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo Teaser */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 relative z-10">
            Parent-Paid Interest
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 relative z-10">
            Set a custom monthly interest rate (e.g., 5%) to automatically reward your kids for
            keeping money in their Savings. Teach them the power of compound interest.
          </p>
          <Link
            to="/parent"
            className="inline-block bg-white text-black font-black px-10 py-4 rounded-full text-lg hover:scale-105 transition shadow-xl relative z-10"
          >
            Try the Parent Dashboard
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/kidvolt-logo.png" alt="KidVolt Logo" className="w-6 h-6 grayscale" />
            <span className="text-gray-500">KidVolt</span>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            💳 Real Money. Real Stocks. Secure and backed by our banking partners.
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `,
        }}
      />
    </div>
  );
}
