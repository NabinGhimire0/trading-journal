import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTradeById } from "../store/tradesSlice";
import TradeForm from "../components/TradeForm";

export default function EditTrade() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrade: trade, loading } = useSelector((state) => state.trades);

  useEffect(() => {
    dispatch(fetchTradeById(id));
  }, [dispatch, id]);

  if (loading || !trade) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Trade</h1>
        <p className="text-gray-500 mt-1">
          Update trade details for {trade.asset_pair}
        </p>
      </div>
      <TradeForm trade={trade} />
    </div>
  );
}
