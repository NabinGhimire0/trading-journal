import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createTrade, updateTrade } from "../store/tradesSlice";
import toast from "react-hot-toast";

const ASSET_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "BTCUSDT",
  "ETHUSDT",
  "Other",
];

const SESSIONS = ["London", "New York", "Asia"];
const TRADE_TYPES = ["BUY", "SELL"];

export default function TradeForm({ trade = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEditing = !!trade;

  const [formData, setFormData] = useState({
    asset_pair: trade?.asset_pair || "",
    trade_type: trade?.trade_type || "BUY",
    entry_price: trade?.entry_price || "",
    exit_price: trade?.exit_price || "",
    lot_size: trade?.lot_size || "",
    stop_loss: trade?.stop_loss || "",
    take_profit: trade?.take_profit || "",
    entry_time: trade?.entry_time
      ? new Date(trade.entry_time).toISOString().slice(0, 16)
      : "",
    exit_time: trade?.exit_time
      ? new Date(trade.exit_time).toISOString().slice(0, 16)
      : "",
    strategy: trade?.strategy || "",
    session: trade?.session || "",
    emotions_before_trade: trade?.emotions_before_trade || "",
    emotions_after_trade: trade?.emotions_after_trade || "",
    notes: trade?.notes || "",
    screenshots: trade?.screenshots || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        exit_price: parseFloat(formData.exit_price),
        lot_size: parseFloat(formData.lot_size),
        stop_loss: parseFloat(formData.stop_loss),
        take_profit: parseFloat(formData.take_profit),
        entry_time: new Date(formData.entry_time).toISOString(),
        exit_time: formData.exit_time
          ? new Date(formData.exit_time).toISOString()
          : "",
      };

      if (isEditing) {
        // Build update payload with only changed fields
        const updatePayload = {};
        Object.keys(payload).forEach((key) => {
          updatePayload[key] = payload[key];
        });
        await dispatch(
          updateTrade({ id: trade.id, data: updatePayload }),
        ).unwrap();
        toast.success("Trade updated successfully!");
      } else {
        await dispatch(createTrade(payload)).unwrap();
        toast.success("Trade created successfully!");
      }
      navigate("/trades");
    } catch (err) {
      toast.error(err || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Trade Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Trade Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Asset Pair *</label>
            <select
              name="asset_pair"
              value={formData.asset_pair}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select pair</option>
              {ASSET_PAIRS.map((pair) => (
                <option key={pair} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Trade Type *</label>
            <div className="flex gap-2">
              {TRADE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      trade_type: type,
                    }))
                  }
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    formData.trade_type === type
                      ? type === "BUY"
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select session</option>
              {SESSIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Price & Size */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Price & Size
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Entry Price *</label>
            <input
              type="number"
              step="any"
              name="entry_price"
              value={formData.entry_price}
              onChange={handleChange}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Exit Price *</label>
            <input
              type="number"
              step="any"
              name="exit_price"
              value={formData.exit_price}
              onChange={handleChange}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lot Size *</label>
            <input
              type="number"
              step="any"
              name="lot_size"
              value={formData.lot_size}
              onChange={handleChange}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stop Loss *</label>
            <input
              type="number"
              step="any"
              name="stop_loss"
              value={formData.stop_loss}
              onChange={handleChange}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Take Profit *</label>
            <input
              type="number"
              step="any"
              name="take_profit"
              value={formData.take_profit}
              onChange={handleChange}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Strategy</label>
            <input
              type="text"
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              placeholder="e.g., Breakout, Trend Following"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Entry Time *</label>
            <input
              type="datetime-local"
              name="entry_time"
              value={formData.entry_time}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Exit Time</label>
            <input
              type="datetime-local"
              name="exit_time"
              value={formData.exit_time}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Psychology & Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Psychology & Notes
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Emotions Before Trade</label>
            <textarea
              name="emotions_before_trade"
              value={formData.emotions_before_trade}
              onChange={handleChange}
              rows={3}
              placeholder="How were you feeling before entering this trade?"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Emotions After Trade</label>
            <textarea
              name="emotions_after_trade"
              value={formData.emotions_after_trade}
              onChange={handleChange}
              rows={3}
              placeholder="How did you feel after closing this trade?"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes about this trade..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Screenshot URL</label>
            <input
              type="url"
              name="screenshots"
              value={formData.screenshots}
              onChange={handleChange}
              placeholder="https://example.com/screenshot.png"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/trades")}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Saving..."
            : isEditing
              ? "Update Trade"
              : "Create Trade"}
        </button>
      </div>
    </form>
  );
}
