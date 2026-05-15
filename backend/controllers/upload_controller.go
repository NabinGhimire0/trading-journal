package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"trading-journal/middleware"

	"github.com/gin-gonic/gin"
)

type UploadController struct{}

func NewUploadController() *UploadController {
    return &UploadController{}
}

func (ctrl *UploadController) UploadScreenshot(c *gin.Context) {
    _ = middleware.GetUserID(c)

    file, err := c.FormFile("screenshot")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
        return
    }

    // Validate file size (max 5MB)
    if file.Size > 5*1024*1024 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File size must be less than 5MB"})
        return
    }

    // Validate file extension
    ext := strings.ToLower(filepath.Ext(file.Filename))
    allowedExts := map[string]bool{
        ".jpg":  true,
        ".jpeg": true,
        ".png":  true,
        ".gif":  true,
        ".webp": true,
    }
    if !allowedExts[ext] {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp",
        })
        return
    }

    // Create uploads directory if it doesn't exist
    uploadDir := "./uploads/screenshots"
    if err := os.MkdirAll(uploadDir, 0755); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
        return
    }

    // Generate unique filename
    filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
    filePath := filepath.Join(uploadDir, filename)

    // Save file
    if err := c.SaveUploadedFile(file, filePath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    // Return the URL path
    url := fmt.Sprintf("/uploads/screenshots/%s", filename)
    c.JSON(http.StatusOK, gin.H{
        "message": "File uploaded successfully",
        "url":     url,
    })
}