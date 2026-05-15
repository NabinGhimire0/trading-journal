package controllers

import (
	"net/http"
	"strconv"
	"time"

	"trading-journal/middleware"
	"trading-journal/services"

	"github.com/gin-gonic/gin"
)

type AnalyticsController struct {
	service *services.AnalyticsService
}

func NewAnalyticsController() *AnalyticsController {
	return &AnalyticsController{
		service: services.NewAnalyticsService(),
	}
}

func (ctrl *AnalyticsController) GetDashboardStats(c *gin.Context) {
	userID := middleware.GetUserID(c)

	stats, err := ctrl.service.GetDashboardStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

func (ctrl *AnalyticsController) GetMonthlyPerformance(c *gin.Context) {
	userID := middleware.GetUserID(c)

	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid year parameter"})
		return
	}

	performance, err := ctrl.service.GetMonthlyPerformance(userID, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"year":        year,
		"performance": performance,
	})
}
