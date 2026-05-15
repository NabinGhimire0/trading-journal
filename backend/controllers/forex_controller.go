package controllers

import (
	"net/http"

	"trading-journal/services"

	"github.com/gin-gonic/gin"
)

type ForexController struct {
	service *services.ForexService
}

func NewForexController(apiKey string) *ForexController {
	return &ForexController{
		service: services.NewForexService(apiKey),
	}
}

func (ctrl *ForexController) GetRates(c *gin.Context) {
	base := c.DefaultQuery("base", "USD")

	rates, err := ctrl.service.GetRates(base)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"base":  base,
		"rates": rates,
	})
}

func (ctrl *ForexController) GetPopularPairs(c *gin.Context) {
	base := c.DefaultQuery("base", "USD")

	pairs, err := ctrl.service.GetPopularPairs(base)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pairs)
}
