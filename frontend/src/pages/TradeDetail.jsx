import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTradeById,
  createTradeReview,
  updateTradeReview,
} from "../store/tradesSlice";
import { formatCurrency, formatDate, formatRR } from "../utils/formatDate";
import {
  ArrowLeft,
  Edit3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Brain,
  FileText,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TradeDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrade: trade, loading } = useSelector((state) => state.trades);

  const [reviewForm, setReviewForm] = useState({
    what_went_right: "",
    what_went_wrong: "",
    lesson_learned: "",
    rating: 3,
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(fetchTradeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (trade?.review) {
      setReviewForm({
        what_went_right: trade.review.what_went_right || "",
        what_went_wrong: trade.review.what_went_wrong || "",
        lesson_learned: trade.review.lesson_learned || "",
        rating: trade.review.rating || 3,
      });
    }
  }, [trade?.review]);

  if (loading || !trade) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isWin = trade.profit_loss >= 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (trade.review) {
        await dispatch(
          updateTradeReview({ tradeId: trade.id, data: reviewForm }),
        ).unwrap();
        toast.success("Review updated!");
      } else {
        await dispatch(
          createTradeReview({ tradeId: trade.id, data: reviewForm }),
        ).unwrap();
        toast.success("Review created!");
      }
      setShowReviewForm(false);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/trades")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {trade.asset_pair}
          </h1>
          <p className="text-gray-500 mt-0.5">
            Entered {formatDate(trade.entry_time)}
          </p>
        </div>
        <Link
          to={`/trades/${trade.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Trade Summary Card */}
      <div
        className={`rounded-xl border-2 p-6 ${
          isWin
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWin ? (
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
            <div>
              <p className="text-sm font-medium opacity-80">
                {isWin ? "Profit" : "Loss"}
              </p>
              <p
                className={`text-3xl font-bold ${
                  isWin ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCurrency(trade.profit_loss)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                trade.trade_type === "BUY"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trade.trade_type}
            </span>
            <p className="mt-2 text-sm text-gray-500">
              R:R{" "}
              {trade.risk_reward_ratio ? `1:${trade.risk_reward_ratio}` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Trade Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Price Details
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Entry Price</dt>
              <dd className="font-medium">{trade.entry_price}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Exit Price</dt>
              <dd className="font-medium">{trade.exit_price}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Lot Size</dt>
              <dd className="font-medium">{trade.lot_size}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Stop Loss</dt>
              <dd className="font-medium text-red-600">{trade.stop_loss}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Take Profit</dt>
              <dd className="font-medium text-emerald-600">
                {trade.take_profit}
              </dd>
            </div>
          </dl>
        </div>

        {/* Time & Context */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Time & Context
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Entry Time</dt>
              <dd className="font-medium text-right">
                {formatDate(trade.entry_time)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Exit Time</dt>
              <dd className="font-medium text-right">
                {trade.exit_time ? formatDate(trade.exit_time) : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Session</dt>
              <dd className="font-medium">{trade.session || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Strategy</dt>
              <dd className="font-medium">{trade.strategy || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Psychology & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            Psychology
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Emotions Before Trade
              </p>
              <p className="text-gray-900">
                {trade.emotions_before_trade || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Emotions After Trade</p>
              <p className="text-gray-900">
                {trade.emotions_after_trade || "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Notes
          </h3>
          <p className="text-gray-900 whitespace-pre-wrap">
            {trade.notes || "No notes added"}
          </p>
          {trade.screenshots && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Screenshot</p>
              <img
                src={
                  trade.screenshots.startsWith("http")
                    ? trade.screenshots
                    : `http://localhost:8080${trade.screenshots}`
                }
                alt="Trade screenshot"
                className="max-w-full max-h-80 rounded-lg border border-gray-200 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Trade Review */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Trade Review
          </h3>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              {trade.review ? "Edit Review" : "Add Review"}
            </button>
          )}
        </div>

        {trade.review && !showReviewForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= trade.review.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">
                What went right
              </p>
              <p className="text-gray-900">
                {trade.review.what_went_right || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                What went wrong
              </p>
              <p className="text-gray-900">
                {trade.review.what_went_wrong || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">
                Lesson learned
              </p>
              <p className="text-gray-900">
                {trade.review.lesson_learned || "-"}
              </p>
            </div>
          </div>
        ) : showReviewForm ? (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: star,
                      }))
                    }
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= reviewForm.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What went right?
              </label>
              <textarea
                value={reviewForm.what_went_right}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    what_went_right: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What went wrong?
              </label>
              <textarea
                value={reviewForm.what_went_wrong}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    what_went_wrong: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson learned?
              </label>
              <textarea
                value={reviewForm.lesson_learned}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    lesson_learned: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 text-sm transition-colors"
              >
                {trade.review ? "Update Review" : "Save Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-400 text-sm">
            No review yet. Click "Add Review" to reflect on this trade.
          </p>
        )}
      </div>
    </div>
  );
}
