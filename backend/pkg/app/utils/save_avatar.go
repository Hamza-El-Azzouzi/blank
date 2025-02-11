package utils

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofrs/uuid/v5"
)

const imageDir = "./storage/avatars"
const MaxImageSize = 3 * 1024 * 1024

func SaveAvatar(base64Data string) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	// Create avatars directory if it doesn't exist
	if err := os.MkdirAll(imageDir, 0755); err != nil {
		return "", err
	}

	// Extract the actual base64 data after the "data:image/..." prefix
	parts := strings.Split(base64Data, ",")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid base64 format")
	}

	// Determine image type from header
	var imageType string
	if strings.Contains(parts[0], "image/jpeg") {
		imageType = "jpeg"
	} else if strings.Contains(parts[0], "image/png") {
		imageType = "png"
	} else {
		return "", fmt.Errorf("unsupported image format")
	}

	// Decode base64 data
	imgData, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return "", err
	}

	if len(imgData) > MaxImageSize {
		return "", fmt.Errorf("image size exceeds maximum allowed (3MB)")
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s.%s", uuid.Must(uuid.NewV4()).String(), imageType)
	filepath := filepath.Join(imageDir, filename)

	// Save the file
	if err := os.WriteFile(filepath, imgData, 0644); err != nil {
		return "", err
	}

	return filename, nil
}
