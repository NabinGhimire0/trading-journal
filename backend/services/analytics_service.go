package services

import (
	"fmt"

	"trading-journal/database"
	"trading-journal/models"
)

type AnalyticsService struct{}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

/* =========================
   INTERNAL AGGREGATORS
========================= */

type strategyAgg struct {
	Strategy    string
	TotalTrades int
	TotalPnL    float64
	Wins        int
	RRSum       float64
	RRCount     int
}

type sessionAgg struct {
	Session     string
	TotalTrades int
	TotalPnL    float64
	Wins        int
}

/* =========================
   DASHBOARD STATS
========================= */

func (s *AnalyticsService) GetDashboardStats(userID string) (*models.DashboardStats, error) {
	db := database.GetDB()

	var trades []models.Trade
	if err := db.Where("user_id = ?", userID).
		Order("entry_time DESC").
		Find(&trades).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch trades: %v", err)
	}

	stats := &models.DashboardStats{}
	stats.TotalTrades = len(trades)

	if len(trades) == 0 {
		return stats, nil
	}

	var (
		wins       int
		totalPnL   float64
		bestPnL    float64
		worstPnL   float64
		totalRR    float64
		rrCount    int
		bestTrade  *models.Trade
		worstTrade *models.Trade
	)

	strategyMap := make(map[string]*strategyAgg)
	sessionMap := make(map[string]*sessionAgg)

	for i := range trades {
		t := &trades[i]
		pnl := t.ProfitLoss

		totalPnL += pnl

		if pnl > 0 {
			wins++
		}

		// Best trade
		if bestTrade == nil || pnl > bestPnL {
			bestPnL = pnl
			bestTrade = t
		}

		// Worst trade
		if worstTrade == nil || pnl < worstPnL {
			worstPnL = pnl
			worstTrade = t
		}

		// Risk reward
		if t.RiskRewardRatio > 0 {
			totalRR += t.RiskRewardRatio
			rrCount++
		}

		/* =========================
		   STRATEGY BREAKDOWN
		========================= */
		if t.Strategy != "" {
			if sp, ok := strategyMap[t.Strategy]; ok {
				sp.TotalTrades++
				sp.TotalPnL += pnl
				if pnl > 0 {
					sp.Wins++
				}
				if t.RiskRewardRatio > 0 {
					sp.RRSum += t.RiskRewardRatio
					sp.RRCount++
				}
			} else {
				strategyMap[t.Strategy] = &strategyAgg{
					Strategy:    t.Strategy,
					TotalTrades: 1,
					TotalPnL:    pnl,
					Wins:        boolToInt(pnl > 0),
				}
				if t.RiskRewardRatio > 0 {
					strategyMap[t.Strategy].RRSum = t.RiskRewardRatio
					strategyMap[t.Strategy].RRCount = 1
				}
			}
		}

		/* =========================
		   SESSION BREAKDOWN
		========================= */
		if t.Session != "" {
			if sp, ok := sessionMap[t.Session]; ok {
				sp.TotalTrades++
				sp.TotalPnL += pnl
				if pnl > 0 {
					sp.Wins++
				}
			} else {
				sessionMap[t.Session] = &sessionAgg{
					Session:     t.Session,
					TotalTrades: 1,
					TotalPnL:    pnl,
					Wins:        boolToInt(pnl > 0),
				}
			}
		}
	}

	/* =========================
	   FINAL STATS
	========================= */

	stats.WinRate = float64(wins) / float64(stats.TotalTrades) * 100
	stats.TotalProfitLoss = totalPnL
	stats.BestTrade = bestTrade
	stats.WorstTrade = worstTrade

	if rrCount > 0 {
		stats.AvgRiskReward = roundToTwo(totalRR / float64(rrCount))
	}

	/* =========================
	   STRATEGY OUTPUT
	========================= */

	for _, sp := range strategyMap {
		model := models.StrategyPerf{
			Strategy:    sp.Strategy,
			TotalTrades: sp.TotalTrades,
			TotalPnL:    sp.TotalPnL,
		}

		if sp.TotalTrades > 0 {
			model.WinRate = roundToTwo(float64(sp.Wins) / float64(sp.TotalTrades) * 100)
		}

		if sp.RRCount > 0 {
			model.AvgRR = roundToTwo(sp.RRSum / float64(sp.RRCount))
		}

		stats.ByStrategy = append(stats.ByStrategy, model)
	}

	/* =========================
	   SESSION OUTPUT
	========================= */

	for _, sp := range sessionMap {
		model := models.SessionPerf{
			Session:     sp.Session,
			TotalTrades: sp.TotalTrades,
			TotalPnL:    sp.TotalPnL,
		}

		if sp.TotalTrades > 0 {
			model.WinRate = roundToTwo(float64(sp.Wins) / float64(sp.TotalTrades) * 100)
		}

		stats.BySession = append(stats.BySession, model)
	}

	/* =========================
	   RECENT TRADES
	========================= */

	recentCount := 5
	if len(trades) < recentCount {
		recentCount = len(trades)
	}
	stats.RecentTrades = trades[:recentCount]

	return stats, nil
}

/* =========================
   MONTHLY PERFORMANCE
========================= */

func (s *AnalyticsService) GetMonthlyPerformance(userID string, year int) ([]models.MonthlyPerformance, error) {
	db := database.GetDB()

	var trades []models.Trade
	if err := db.Where("user_id = ? AND EXTRACT(YEAR FROM entry_time) = ?", userID, year).
		Order("entry_time ASC").
		Find(&trades).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch trades: %v", err)
	}

	monthMap := make(map[int]*models.MonthlyPerformance)

	for i := range trades {
		t := &trades[i]
		month := int(t.EntryTime.Month())

		if mp, ok := monthMap[month]; ok {
			mp.TotalTrades++
			mp.ProfitLoss += t.ProfitLoss
			if t.ProfitLoss > 0 {
				mp.Wins++
			} else {
				mp.Losses++
			}
		} else {
			mp := &models.MonthlyPerformance{
				Month:       t.EntryTime.Format("January 2006"),
				TotalTrades: 1,
				ProfitLoss:  t.ProfitLoss,
			}
			if t.ProfitLoss > 0 {
				mp.Wins = 1
			} else {
				mp.Losses = 1
			}
			monthMap[month] = mp
		}
	}

	var result []models.MonthlyPerformance
	for month := 1; month <= 12; month++ {
		if mp, ok := monthMap[month]; ok {
			mp.WinRate = roundToTwo(float64(mp.Wins) / float64(mp.TotalTrades) * 100)
			result = append(result, *mp)
		}
	}

	return result, nil
}

/* =========================
   HELPERS
========================= */

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func roundToTwo(val float64) float64 {
	return float64(int(val*100+0.5)) / 100
}
