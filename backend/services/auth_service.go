package services

import (
	"errors"

	"trading-journal/database"
	"trading-journal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Register(input models.RegisterInput) (*models.User, error) {
	db := database.GetDB()

	// Check if email already exists
	var existingUser models.User
	if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := db.Create(&user).Error; err != nil {
		return nil, errors.New("failed to create user")
	}

	return &user, nil
}

func (s *AuthService) Login(input models.LoginInput) (*models.User, error) {
	db := database.GetDB()

	var user models.User
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, errors.New("database error")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	return &user, nil
}

func (s *AuthService) GetUserByID(userID string) (*models.User, error) {
	db := database.GetDB()

	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}

	return &user, nil
}
