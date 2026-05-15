import TradeForm from "../components/TradeForm";

export default function AddTrade() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Trade</h1>
        <p className="text-gray-500 mt-1">
          Record your trade details for analysis
        </p>
      </div>
      <TradeForm />
    </div>
  );
}
