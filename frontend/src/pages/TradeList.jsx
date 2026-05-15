import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTrades, deleteTrade } from "../store/tradesSlice";
import { formatCurrency, formatDate } from "../utils/formatDate";
import { PlusCircle, Trash2, Eye, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function TradeList() {
  const dispatch = useDispatch();
  const { trades, total, loading } = useSelector((state) => state.trades);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    asset_pair: "",
    trade_type: "",
    strategy: "",
    session: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTrades({ page, limit: 20, ...filters }));
  }, [dispatch, page, filters]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      try {
        await dispatch(deleteTrade(id)).unwrap();
        toast.success("Trade deleted");
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ asset_pair: "", trade_type: "", strategy: "", session: "" });
    setPage(1);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trades</h1>
          <p className="text-gray-500 mt-1">{total} total trades</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <Link
            to="/trades/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Add Trade
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search asset pair..."
              value={filters.asset_pair}
              onChange={(e) => handleFilterChange("asset_pair", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <select
              value={filters.trade_type}
              onChange={(e) => handleFilterChange("trade_type", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
              <option value="">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <input
              type="text"
              placeholder="Strategy..."
              value={filters.strategy}
              onChange={(e) => handleFilterChange("strategy", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <select
              value={filters.session}
              onChange={(e) => handleFilterChange("session", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
              <option value="">All Sessions</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Asia">Asia</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Trades Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trades found</p>
            <Link
              to="/trades/new"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-2 inline-block"
            >
              Add your first trade →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Pair
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Entry
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Exit
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    P&L
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    R:R
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Strategy
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {trade.asset_pair}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="text-right px-4 py-3">
                      {trade.entry_price}
                    </td>
                    <td className="text-right px-4 py-3">{trade.exit_price}</td>
                    <td
                      className={`text-right px-4 py-3 font-semibold ${
                        trade.profit_loss >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(trade.profit_loss)}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-500">
                      {trade.risk_reward_ratio
                        ? `1:${trade.risk_reward_ratio}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {trade.strategy || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(trade.entry_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/trades/${trade.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
