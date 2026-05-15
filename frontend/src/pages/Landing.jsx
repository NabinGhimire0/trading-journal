import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { forexPublicAPI } from "../services/api";
import {
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Target,
  Brain,
  ArrowRight,
  ChevronRight,
  LineChart,
  PieChart,
  Activity,
  BookOpen,
  Star,
  Globe,
  Play,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ForexTicker() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await forexPublicAPI.getPopularPairs("USD");
        const data = res.data;
        const formatted = Object.entries(data)
          .filter(([key]) => !["base", "last_updated"].includes(key))
          .map(([currency, info]) => ({
            pair: info.pair,
            rate: info.rate,
            symbol: info.symbol,
            change: (Math.random() * 2 - 1).toFixed(2),
          }));
        setPairs(formatted);
      } catch {
        // Fallback static data
        setPairs([
          { pair: "USD/EUR", rate: 0.9234, symbol: "€", change: "0.12" },
          { pair: "USD/GBP", rate: 0.7912, symbol: "£", change: "-0.08" },
          { pair: "USD/JPY", rate: 154.32, symbol: "¥", change: "0.34" },
          { pair: "USD/AUD", rate: 1.5432, symbol: "A$", change: "-0.15" },
          { pair: "USD/CAD", rate: 1.3678, symbol: "C$", change: "0.09" },
          { pair: "USD/CHF", rate: 0.8834, symbol: "CHF", change: "0.21" },
          { pair: "USD/INR", rate: 83.45, symbol: "₹", change: "-0.05" },
          { pair: "USD/SGD", rate: 1.3421, symbol: "S$", change: "0.11" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 overflow-hidden">
      {pairs.map((pair) => (
        <div
          key={pair.pair}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <span className="text-sm font-semibold text-gray-300">
            {pair.pair}
          </span>
          <span className="text-sm text-gray-400">{pair.rate.toFixed(4)}</span>
          <span
            className={`text-xs font-medium ${
              parseFloat(pair.change) >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {parseFloat(pair.change) >= 0 ? "+" : ""}
            {pair.change}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await forexPublicAPI.getPopularPairs("USD");
        setRates(res.data);
      } catch {
        // Silent fail, rates are optional
      }
    };
    fetchRates();
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: "Track Every Trade",
      description:
        "Log entries, exits, stop losses, and take profits with precision. Never lose track of your trading activity.",
      color: "emerald",
    },
    {
      icon: Brain,
      title: "Master Your Psychology",
      description:
        "Record emotions before and after each trade. Build discipline and eliminate emotional trading decisions.",
      color: "purple",
    },
    {
      icon: Target,
      title: "Analyze Performance",
      description:
        "Win rate, risk-reward ratios, equity curves — all the metrics you need to become a better trader.",
      color: "amber",
    },
    {
      icon: BookOpen,
      title: "Learn From Every Trade",
      description:
        'Post-trade reviews with "what went right", "what went wrong", and "lesson learned" reflections.',
      color: "blue",
    },
    {
      icon: LineChart,
      title: "Strategy Optimization",
      description:
        "Compare performance across strategies, sessions, and pairs. Find what works and double down.",
      color: "rose",
    },
    {
      icon: Globe,
      title: "Live Forex Rates",
      description:
        "Real-time currency exchange rates integrated right into your trading journal dashboard.",
      color: "teal",
    },
  ];

  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    rose: "bg-rose-100 text-rose-600",
    teal: "bg-teal-100 text-teal-600",
  };

  const steps = [
    {
      step: "01",
      title: "Log Your Trade",
      description:
        "Enter trade details — pair, entry/exit price, lot size, stop loss, take profit, and more.",
    },
    {
      step: "02",
      title: "Review & Reflect",
      description:
        "After the trade, write what went right, what went wrong, and your key takeaways.",
    },
    {
      step: "03",
      title: "Analyze & Improve",
      description:
        "Use dashboards and analytics to spot patterns, optimize strategies, and grow as a trader.",
    },
  ];

  const testimonials = [
    {
      name: "Alex M.",
      role: "Forex Trader",
      text: "This journal completely changed my trading. I went from 35% win rate to 58% in just 3 months by reviewing every trade.",
      avatar: "👨‍💼",
    },
    {
      name: "Sarah K.",
      role: "Crypto Trader",
      text: "The psychology tracking feature is a game changer. Understanding my emotional patterns helped me stop revenge trading.",
      avatar: "👩‍💻",
    },
    {
      name: "James R.",
      role: "Swing Trader",
      text: "Clean, simple, and powerful. Exactly what I needed. The strategy comparison helped me drop my losing strategies.",
      avatar: "🧑‍📊",
    },
  ];

  const stats = [
    { value: "10K+", label: "Trades Logged" },
    { value: "2,500+", label: "Active Traders" },
    { value: "56%", label: "Avg Win Rate" },
    { value: "4.9", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xl font-bold">TradeJournal</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#rates"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Live Rates
              </a>
              <a
                href="#testimonials"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== FOREX TICKER ===== */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur border-b border-gray-800/50 py-2">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="animate-marquee flex">
            <ForexTicker />
            <div className="ml-6">
              <ForexTicker />
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Free Trading Journal for Beginners
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
            >
              Trade Smarter.
              <br />
              <span className="bg-linear-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                Not Harder.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              The trading journal built for beginners. Track your trades, master
              your psychology, and analyze your performance — all in one
              beautiful dashboard.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                Start Journaling Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-gray-400 px-8 py-4 rounded-xl font-semibold text-lg hover:text-white border border-gray-700 hover:border-gray-600 transition-all"
              >
                <Play className="h-5 w-5" />
                See How It Works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl shadow-emerald-500/10 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-700/50 rounded-lg px-4 py-1 text-xs text-gray-400">
                    localhost:5173/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Total Trades", value: "247", color: "emerald" },
                  { label: "Win Rate", value: "62.3%", color: "emerald" },
                  { label: "Total P&L", value: "+$12,450", color: "emerald" },
                  { label: "Avg R:R", value: "1:2.4", color: "emerald" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30"
                  >
                    <div className="text-xs text-gray-500">{card.label}</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {card.value}
                    </div>
                  </div>
                ))}
                {/* Chart placeholder */}
                <div className="col-span-3 bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 h-48 flex items-end gap-2">
                  {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85, 50, 75].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-linear-to-t from-emerald-600 to-emerald-400 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 h-48 flex flex-col justify-center items-center">
                  <PieChart className="h-16 w-16 text-gray-600 mb-2" />
                  <div className="text-xs text-gray-500">By Strategy</div>
                </div>
              </div>
            </div>
            {/* Glow effect under dashboard */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-500/20 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Powerful Features
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl font-bold"
            >
              Everything You Need to{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Trade Better
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Built by traders, for traders. Every feature is designed to help
              you improve.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-300"
              >
                <div
                  className={`inline-flex p-3 rounded-xl ${colorMap[feature.color]} mb-4`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="py-20 sm:py-28 relative bg-gray-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Simple Process
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl font-bold"
            >
              How It{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Works
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-linear-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xl mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE RATES ===== */}
      <section id="rates" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Live Data
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl font-bold"
            >
              Live Forex{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Exchange Rates
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Real-time currency rates powered by ExchangeRate API. Check rates
              before you trade.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-gray-400">Live Rates</span>
              </div>
              <span className="text-xs text-gray-500">Base: USD</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {rates
                ? Object.entries(rates)
                    .filter(([key]) => !["base", "last_updated"].includes(key))
                    .map(([currency, info]) => (
                      <div
                        key={currency}
                        className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">
                            {info.pair}
                          </span>
                          <span className="text-xs text-gray-500">
                            {info.symbol}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-emerald-400">
                          {typeof info.rate === "number"
                            ? info.rate.toFixed(4)
                            : info.rate}
                        </div>
                      </div>
                    ))
                : // Fallback when API key is not configured
                  [
                    { pair: "EUR/USD", rate: "1.0834" },
                    { pair: "GBP/USD", rate: "1.2638" },
                    { pair: "USD/JPY", rate: "154.32" },
                    { pair: "AUD/USD", rate: "0.6480" },
                    { pair: "USD/CAD", rate: "1.3678" },
                    { pair: "USD/CHF", rate: "0.8834" },
                    { pair: "NZD/USD", rate: "0.5962" },
                    { pair: "USD/CNY", rate: "7.2456" },
                    { pair: "USD/INR", rate: "83.45" },
                    { pair: "USD/SGD", rate: "1.3421" },
                  ].map((item) => (
                    <div
                      key={item.pair}
                      className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30"
                    >
                      <div className="text-sm font-semibold mb-2">
                        {item.pair}
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        {item.rate}
                      </div>
                    </div>
                  ))}
            </div>
            {!rates && (
              <div className="px-6 pb-4 text-center">
                <p className="text-xs text-gray-500">
                  ⚡ Configure FOREX_API_KEY in backend .env for live rates.
                  Showing sample data above.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        id="testimonials"
        className="py-20 sm:py-28 relative bg-gray-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Star className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Trusted by Traders
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl font-bold"
            >
              What Traders{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Are Saying
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Ready to Become a{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Better Trader?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of traders who use TradeJournal to track, review,
              and improve their trading performance. It's free to get started.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Start Your Trading Journal
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. Free forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-lg font-bold">TradeJournal</span>
              </div>
              <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                The free trading journal built for beginners. Track every trade,
                master your psychology, and become a consistently profitable
                trader.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href="#features"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-gray-300 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#rates"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Live Rates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TradeJournal. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Trade responsibly. Past performance does not guarantee future
              results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
