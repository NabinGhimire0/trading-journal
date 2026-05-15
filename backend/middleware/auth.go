package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"trading-journal/config"
	"trading-journal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID, email string) (string, error) {
	expirationHours := 72 // default
	if config.AppConfig.JWTExpirationHrs != "" {
		fmt.Sscanf(config.AppConfig.JWTExpirationHrs, "%d", &expirationHours)
	}

	claims := &models.JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expirationHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &models.JWTClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(config.AppConfig.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}

func GetUserID(c *gin.Context) string {
	userID, _ := c.Get("user_id")
	return userID.(string)
}
