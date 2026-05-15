import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchDashboardStats,
  fetchMonthlyPerformance,
} from "../store/analyticsSlice";
import StatCard from "../components/StatCard";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  PlusCircle,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatCurrency, formatPercent } from "../utils/formatDate";

export default function Dashboard() {
  const dispatch = useDispatch();

  const { stats, monthlyPerformance, loading } = useSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchMonthlyPerformance(new Date().getFullYear()));
  }, [dispatch]);

  // ✅ SAFE FALLBACKS (prevents all null crashes)
  const safeMonthlyPerformance = monthlyPerformance || [];

  const safeStats = {
    total_trades: stats?.total_trades || 0,
    win_rate: stats?.win_rate || 0,
    total_profit_loss: stats?.total_profit_loss || 0,
    avg_risk_reward: stats?.avg_risk_reward || 0,
    by_strategy: stats?.by_strategy || [],
    by_session: stats?.by_session || [],
    recent_trades: stats?.recent_trades || [],
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Your trading performance at a glance
          </p>
        </div>

        <Link
          to="/app/trades/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors self-start"
        >
          <PlusCircle className="h-5 w-5" />
          New Trade
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trades"
          value={safeStats.total_trades}
          icon={Activity}
          color="blue"
        />

        <StatCard
          title="Win Rate"
          value={formatPercent(safeStats.win_rate)}
          subtitle={
            safeStats.total_trades > 0
              ? `${Math.round(
                  (safeStats.total_trades * safeStats.win_rate) / 100
                )} wins`
              : ""
          }
          icon={Target}
          color={safeStats.win_rate >= 50 ? "emerald" : "red"}
        />

        <StatCard
          title="Total P&L"
          value={formatCurrency(safeStats.total_profit_loss)}
          icon={
            safeStats.total_profit_loss >= 0 ? TrendingUp : TrendingDown
          }
          color={safeStats.total_profit_loss >= 0 ? "emerald" : "red"}
        />

        <StatCard
          title="Avg Risk:Reward"
          value={
            safeStats.avg_risk_reward
              ? `1:${safeStats.avg_risk_reward}`
              : "-"
          }
          icon={Award}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly P&L
          </h3>

          {safeMonthlyPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeMonthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar
                  dataKey="profit_loss"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="P&L"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-75 flex items-center justify-center text-gray-400">
              No monthly data yet
            </div>
          )}
        </div>

        {/* Win Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Win Rate Trend
          </h3>

          {safeMonthlyPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeMonthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="win_rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Win Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-75 flex items-center justify-center text-gray-400">
              No monthly data yet
            </div>
          )}
        </div>
      </div>

      {/* Strategy & Session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Strategy
          </h3>

          {safeStats.by_strategy.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">
                      Strategy
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Trades
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Win %
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {safeStats.by_strategy.map((s) => (
                    <tr key={s.strategy} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{s.strategy}</td>
                      <td className="text-right py-2">{s.total_trades}</td>
                      <td className="text-right py-2">
                        {formatPercent(s.win_rate)}
                      </td>
                      <td
                        className={`text-right py-2 font-medium ${
                          s.total_pnl >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(s.total_pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No strategy data yet</p>
          )}
        </div>

        {/* Session */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Session
          </h3>

          {safeStats.by_session.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">
                      Session
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Trades
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Win %
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {safeStats.by_session.map((s) => (
                    <tr key={s.session} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{s.session}</td>
                      <td className="text-right py-2">{s.total_trades}</td>
                      <td className="text-right py-2">
                        {formatPercent(s.win_rate)}
                      </td>
                      <td
                        className={`text-right py-2 font-medium ${
                          s.total_pnl >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(s.total_pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No session data yet</p>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Trades
          </h3>

          <Link
            to="/app/trades"
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
          >
            View all →
          </Link>
        </div>

        {safeStats.recent_trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Pair
                  </th>
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Type
                  </th>
                  <th className="text-right py-2 text-gray-500 font-medium">
                    P&L
                  </th>
                  <th className="text-right py-2 text-gray-500 font-medium">
                    R:R
                  </th>
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Strategy
                  </th>
                </tr>
              </thead>

              <tbody>
                {safeStats.recent_trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium">{trade.asset_pair}</td>

                    <td>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          trade.trade_type === "BUY"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {trade.trade_type}
                      </span>
                    </td>

                    <td
                      className={`text-right py-2 font-medium ${
                        trade.profit_loss >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(trade.profit_loss)}
                    </td>

                    <td className="text-right py-2 text-gray-500">
                      {trade.risk_reward_ratio
                        ? `1:${trade.risk_reward_ratio}`
                        : "-"}
                    </td>

                    <td className="py-2 text-gray-500">
                      {trade.strategy || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trades yet</p>
            <Link
              to="/app/trades/new"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-2 inline-block"
            >
              Add your first trade →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}