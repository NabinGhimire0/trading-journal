package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// ==================== User Model ====================

type User struct {
	ID         string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"size:100;not null" json:"name"`
	Email      string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password   string         `gorm:"size:255;not null" json:"-"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	Trades     []Trade        `gorm:"foreignKey:UserID" json:"trades,omitempty"`
	Strategies []Strategy     `gorm:"foreignKey:UserID" json:"strategies,omitempty"`
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// ==================== Strategy Model ====================

type Strategy struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      string         `gorm:"type:uuid;index;not null" json:"user_id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ==================== Trade Model ====================

type Trade struct {
	ID                  string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID              string         `gorm:"type:uuid;index;not null" json:"user_id"`
	AssetPair           string         `gorm:"size:50;not null" json:"asset_pair"`
	TradeType           string         `gorm:"size:10;not null;check:trade_type IN ('BUY','SELL')" json:"trade_type"`
	EntryPrice          float64        `gorm:"not null" json:"entry_price"`
	ExitPrice           float64        `gorm:"not null" json:"exit_price"`
	LotSize             float64        `gorm:"not null" json:"lot_size"`
	StopLoss            float64        `gorm:"not null" json:"stop_loss"`
	TakeProfit          float64        `gorm:"not null" json:"take_profit"`
	ProfitLoss          float64        `gorm:"-" json:"profit_loss"`
	RiskRewardRatio     float64        `gorm:"-" json:"risk_reward_ratio"`
	EntryTime           time.Time      `gorm:"not null" json:"entry_time"`
	ExitTime            *time.Time     `json:"exit_time"`
	Strategy            string         `gorm:"size:100" json:"strategy"`
	Session             string         `gorm:"size:20;check:session IN ('London','New York','Asia')" json:"session"`
	EmotionsBeforeTrade string         `json:"emotions_before_trade"`
	EmotionsAfterTrade  string         `json:"emotions_after_trade"`
	Notes               string         `json:"notes"`
	Screenshots         string         `json:"screenshots"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
	Review              *TradeReview   `gorm:"foreignKey:TradeID" json:"review,omitempty"`
}

// AfterFind hook to calculate derived fields
func (t *Trade) AfterFind(db *gorm.DB) error {
	t.ProfitLoss = t.CalculateProfitLoss()
	t.RiskRewardRatio = t.CalculateRiskReward()
	return nil
}

func (t *Trade) CalculateProfitLoss() float64 {
	if t.TradeType == "BUY" {
		return (t.ExitPrice - t.EntryPrice) * t.LotSize
	}
	return (t.EntryPrice - t.ExitPrice) * t.LotSize
}

func (t *Trade) CalculateRiskReward() float64 {
	if t.TradeType == "BUY" {
		risk := t.EntryPrice - t.StopLoss
		if risk == 0 {
			return 0
		}
		reward := t.TakeProfit - t.EntryPrice
		return roundToTwo(reward / risk)
	}
	risk := t.StopLoss - t.EntryPrice
	if risk == 0 {
		return 0
	}
	reward := t.EntryPrice - t.TakeProfit
	return roundToTwo(reward / risk)
}

func roundToTwo(val float64) float64 {
	return float64(int(val*100+0.5)) / 100
}

type CreateTradeInput struct {
	AssetPair           string  `json:"asset_pair" binding:"required"`
	TradeType           string  `json:"trade_type" binding:"required,oneof=BUY SELL"`
	EntryPrice          float64 `json:"entry_price" binding:"required"`
	ExitPrice           float64 `json:"exit_price" binding:"required"`
	LotSize             float64 `json:"lot_size" binding:"required"`
	StopLoss            float64 `json:"stop_loss" binding:"required"`
	TakeProfit          float64 `json:"take_profit" binding:"required"`
	EntryTime           string  `json:"entry_time" binding:"required"`
	ExitTime            string  `json:"exit_time"`
	Strategy            string  `json:"strategy"`
	Session             string  `json:"session" binding:"omitempty,oneof=London 'New York' Asia"`
	EmotionsBeforeTrade string  `json:"emotions_before_trade"`
	EmotionsAfterTrade  string  `json:"emotions_after_trade"`
	Notes               string  `json:"notes"`
	Screenshots         string  `json:"screenshots"`
}

type UpdateTradeInput struct {
	AssetPair           *string  `json:"asset_pair"`
	TradeType           *string  `json:"trade_type" binding:"omitempty,oneof=BUY SELL"`
	EntryPrice          *float64 `json:"entry_price"`
	ExitPrice           *float64 `json:"exit_price"`
	LotSize             *float64 `json:"lot_size"`
	StopLoss            *float64 `json:"stop_loss"`
	TakeProfit          *float64 `json:"take_profit"`
	EntryTime           *string  `json:"entry_time"`
	ExitTime            *string  `json:"exit_time"`
	Strategy            *string  `json:"strategy"`
	Session             *string  `json:"session" binding:"omitempty,oneof=London 'New York' Asia"`
	EmotionsBeforeTrade *string  `json:"emotions_before_trade"`
	EmotionsAfterTrade  *string  `json:"emotions_after_trade"`
	Notes               *string  `json:"notes"`
	Screenshots         *string  `json:"screenshots"`
}

// ==================== Trade Review Model ====================

type TradeReview struct {
	ID            string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TradeID       string         `gorm:"type:uuid;uniqueIndex;not null" json:"trade_id"`
	WhatWentRight string         `json:"what_went_right"`
	WhatWentWrong string         `json:"what_went_wrong"`
	LessonLearned string         `json:"lesson_learned"`
	Rating        int            `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateTradeReviewInput struct {
	WhatWentRight string `json:"what_went_right"`
	WhatWentWrong string `json:"what_went_wrong"`
	LessonLearned string `json:"lesson_learned"`
	Rating        int    `json:"rating" binding:"omitempty,min=1,max=5"`
}

type UpdateTradeReviewInput struct {
	WhatWentRight *string `json:"what_went_right"`
	WhatWentWrong *string `json:"what_went_wrong"`
	LessonLearned *string `json:"lesson_learned"`
	Rating        *int    `json:"rating" binding:"omitempty,min=1,max=5"`
}

// ==================== Analytics Models ====================

type DashboardStats struct {
	TotalTrades     int            `json:"total_trades"`
	WinRate         float64        `json:"win_rate"`
	TotalProfitLoss float64        `json:"total_profit_loss"`
	BestTrade       *Trade         `json:"best_trade"`
	WorstTrade      *Trade         `json:"worst_trade"`
	AvgRiskReward   float64        `json:"avg_risk_reward"`
	ByStrategy      []StrategyPerf `json:"by_strategy"`
	BySession       []SessionPerf  `json:"by_session"`
	RecentTrades    []Trade        `json:"recent_trades"`
}

type StrategyPerf struct {
	Strategy    string  `json:"strategy"`
	TotalTrades int     `json:"total_trades"`
	WinRate     float64 `json:"win_rate"`
	TotalPnL    float64 `json:"total_pnl"`
	AvgRR       float64 `json:"avg_rr"`
	RRSum       float64 `json:"-"`
	RRCount     int     `json:"-"`
	Wins        int     `json:"-"`
}

type SessionPerf struct {
	Session     string  `json:"session"`
	TotalTrades int     `json:"total_trades"`
	WinRate     float64 `json:"win_rate"`
	TotalPnL    float64 `json:"total_pnl"`
	Wins        int     `json:"-"`
}

type MonthlyPerformance struct {
	Month       string  `json:"month"`
	TotalTrades int     `json:"total_trades"`
	Wins        int     `json:"wins"`
	Losses      int     `json:"losses"`
	WinRate     float64 `json:"win_rate"`
	ProfitLoss  float64 `json:"profit_loss"`
}

// AutoMigrate runs GORM auto-migration
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Strategy{},
		&Trade{},
		&TradeReview{},
	)
}
