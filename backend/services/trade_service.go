package services

import (
	"errors"
	"time"

	"trading-journal/database"
	"trading-journal/models"

	"gorm.io/gorm"
)

type TradeService struct{}

func NewTradeService() *TradeService {
	return &TradeService{}
}

func (s *TradeService) CreateTrade(userID string, input models.CreateTradeInput) (*models.Trade, error) {
	db := database.GetDB()

	entryTime, err := time.Parse(time.RFC3339, input.EntryTime)
	if err != nil {
		return nil, errors.New("invalid entry_time format, use RFC3339")
	}

	trade := models.Trade{
		UserID:              userID,
		AssetPair:           input.AssetPair,
		TradeType:           input.TradeType,
		EntryPrice:          input.EntryPrice,
		ExitPrice:           input.ExitPrice,
		LotSize:             input.LotSize,
		StopLoss:            input.StopLoss,
		TakeProfit:          input.TakeProfit,
		EntryTime:           entryTime,
		Strategy:            input.Strategy,
		Session:             input.Session,
		EmotionsBeforeTrade: input.EmotionsBeforeTrade,
		EmotionsAfterTrade:  input.EmotionsAfterTrade,
		Notes:               input.Notes,
		Screenshots:         input.Screenshots,
	}

	if input.ExitTime != "" {
		exitTime, err := time.Parse(time.RFC3339, input.ExitTime)
		if err != nil {
			return nil, errors.New("invalid exit_time format, use RFC3339")
		}
		trade.ExitTime = &exitTime
	}

	if err := db.Create(&trade).Error; err != nil {
		return nil, errors.New("failed to create trade")
	}

	// Reload to trigger AfterFind hook
	db.Preload("Review").First(&trade, "id = ?", trade.ID)

	return &trade, nil
}

func (s *TradeService) GetTrades(userID string, page, limit int, assetPair, tradeType, strategy, session string) ([]models.Trade, int64, error) {
	db := database.GetDB()
	var trades []models.Trade
	var total int64

	query := db.Model(&models.Trade{}).Where("user_id = ?", userID)

	// Filters
	if assetPair != "" {
		query = query.Where("asset_pair ILIKE ?", "%"+assetPair+"%")
	}
	if tradeType != "" {
		query = query.Where("trade_type = ?", tradeType)
	}
	if strategy != "" {
		query = query.Where("strategy ILIKE ?", "%"+strategy+"%")
	}
	if session != "" {
		query = query.Where("session = ?", session)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Review").Order("entry_time DESC").Offset(offset).Limit(limit).Find(&trades).Error; err != nil {
		return nil, 0, errors.New("failed to fetch trades")
	}

	return trades, total, nil
}

func (s *TradeService) GetTradeByID(userID, tradeID string) (*models.Trade, error) {
	db := database.GetDB()

	var trade models.Trade
	if err := db.Preload("Review").Where("id = ? AND user_id = ?", tradeID, userID).First(&trade).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("trade not found")
		}
		return nil, errors.New("database error")
	}

	return &trade, nil
}

func (s *TradeService) UpdateTrade(userID, tradeID string, input models.UpdateTradeInput) (*models.Trade, error) {
	db := database.GetDB()

	var trade models.Trade
	if err := db.Where("id = ? AND user_id = ?", tradeID, userID).First(&trade).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("trade not found")
		}
		return nil, errors.New("database error")
	}

	updates := make(map[string]interface{})

	if input.AssetPair != nil {
		updates["asset_pair"] = *input.AssetPair
	}
	if input.TradeType != nil {
		updates["trade_type"] = *input.TradeType
	}
	if input.EntryPrice != nil {
		updates["entry_price"] = *input.EntryPrice
	}
	if input.ExitPrice != nil {
		updates["exit_price"] = *input.ExitPrice
	}
	if input.LotSize != nil {
		updates["lot_size"] = *input.LotSize
	}
	if input.StopLoss != nil {
		updates["stop_loss"] = *input.StopLoss
	}
	if input.TakeProfit != nil {
		updates["take_profit"] = *input.TakeProfit
	}
	if input.EntryTime != nil {
		entryTime, err := time.Parse(time.RFC3339, *input.EntryTime)
		if err != nil {
			return nil, errors.New("invalid entry_time format")
		}
		updates["entry_time"] = entryTime
	}
	if input.ExitTime != nil {
		exitTime, err := time.Parse(time.RFC3339, *input.ExitTime)
		if err != nil {
			return nil, errors.New("invalid exit_time format")
		}
		updates["exit_time"] = exitTime
	}
	if input.Strategy != nil {
		updates["strategy"] = *input.Strategy
	}
	if input.Session != nil {
		updates["session"] = *input.Session
	}
	if input.EmotionsBeforeTrade != nil {
		updates["emotions_before_trade"] = *input.EmotionsBeforeTrade
	}
	if input.EmotionsAfterTrade != nil {
		updates["emotions_after_trade"] = *input.EmotionsAfterTrade
	}
	if input.Notes != nil {
		updates["notes"] = *input.Notes
	}
	if input.Screenshots != nil {
		updates["screenshots"] = *input.Screenshots
	}

	if len(updates) > 0 {
		if err := db.Model(&trade).Updates(updates).Error; err != nil {
			return nil, errors.New("failed to update trade")
		}
	}

	// Reload
	db.Preload("Review").First(&trade, "id = ?", trade.ID)

	return &trade, nil
}

func (s *TradeService) DeleteTrade(userID, tradeID string) error {
	db := database.GetDB()

	result := db.Where("id = ? AND user_id = ?", tradeID, userID).Delete(&models.Trade{})
	if result.RowsAffected == 0 {
		return errors.New("trade not found")
	}

	return nil
}

// ==================== Trade Review ====================

func (s *TradeService) CreateTradeReview(userID, tradeID string, input models.CreateTradeReviewInput) (*models.TradeReview, error) {
	db := database.GetDB()

	// Verify trade belongs to user
	var trade models.Trade
	if err := db.Where("id = ? AND user_id = ?", tradeID, userID).First(&trade).Error; err != nil {
		return nil, errors.New("trade not found")
	}

	// Check if review already exists
	var existing models.TradeReview
	if err := db.Where("trade_id = ?", tradeID).First(&existing).Error; err == nil {
		return nil, errors.New("review already exists for this trade, use PUT to update")
	}

	review := models.TradeReview{
		TradeID:       tradeID,
		WhatWentRight: input.WhatWentRight,
		WhatWentWrong: input.WhatWentWrong,
		LessonLearned: input.LessonLearned,
		Rating:        input.Rating,
	}

	if err := db.Create(&review).Error; err != nil {
		return nil, errors.New("failed to create review")
	}

	return &review, nil
}

func (s *TradeService) UpdateTradeReview(userID, tradeID string, input models.UpdateTradeReviewInput) (*models.TradeReview, error) {
	db := database.GetDB()

	// Verify trade belongs to user
	var trade models.Trade
	if err := db.Where("id = ? AND user_id = ?", tradeID, userID).First(&trade).Error; err != nil {
		return nil, errors.New("trade not found")
	}

	var review models.TradeReview
	if err := db.Where("trade_id = ?", tradeID).First(&review).Error; err != nil {
		return nil, errors.New("review not found")
	}

	updates := make(map[string]interface{})
	if input.WhatWentRight != nil {
		updates["what_went_right"] = *input.WhatWentRight
	}
	if input.WhatWentWrong != nil {
		updates["what_went_wrong"] = *input.WhatWentWrong
	}
	if input.LessonLearned != nil {
		updates["lesson_learned"] = *input.LessonLearned
	}
	if input.Rating != nil {
		updates["rating"] = *input.Rating
	}

	if len(updates) > 0 {
		if err := db.Model(&review).Updates(updates).Error; err != nil {
			return nil, errors.New("failed to update review")
		}
	}

	db.First(&review, "id = ?", review.ID)

	return &review, nil
}
