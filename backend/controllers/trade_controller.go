package controllers

import (
	"net/http"
	"strconv"

	"trading-journal/middleware"
	"trading-journal/models"
	"trading-journal/services"

	"github.com/gin-gonic/gin"
)

type TradeController struct {
	service *services.TradeService
}

func NewTradeController() *TradeController {
	return &TradeController{
		service: services.NewTradeService(),
	}
}

func (ctrl *TradeController) CreateTrade(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var input models.CreateTradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trade, err := ctrl.service.CreateTrade(userID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Trade created successfully",
		"trade":   trade,
	})
}

func (ctrl *TradeController) GetTrades(c *gin.Context) {
	userID := middleware.GetUserID(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	assetPair := c.Query("asset_pair")
	tradeType := c.Query("trade_type")
	strategy := c.Query("strategy")
	session := c.Query("session")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	trades, total, err := ctrl.service.GetTrades(userID, page, limit, assetPair, tradeType, strategy, session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"trades": trades,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

func (ctrl *TradeController) GetTradeByID(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tradeID := c.Param("id")

	trade, err := ctrl.service.GetTradeByID(userID, tradeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"trade": trade})
}

func (ctrl *TradeController) UpdateTrade(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tradeID := c.Param("id")

	var input models.UpdateTradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trade, err := ctrl.service.UpdateTrade(userID, tradeID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Trade updated successfully",
		"trade":   trade,
	})
}

func (ctrl *TradeController) DeleteTrade(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tradeID := c.Param("id")

	if err := ctrl.service.DeleteTrade(userID, tradeID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Trade deleted successfully"})
}

// ==================== Trade Review ====================

func (ctrl *TradeController) CreateTradeReview(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tradeID := c.Param("id")

	var input models.CreateTradeReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := ctrl.service.CreateTradeReview(userID, tradeID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Review created successfully",
		"review":  review,
	})
}

func (ctrl *TradeController) UpdateTradeReview(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tradeID := c.Param("id")

	var input models.UpdateTradeReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := ctrl.service.UpdateTradeReview(userID, tradeID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review updated successfully",
		"review":  review,
	})
}
