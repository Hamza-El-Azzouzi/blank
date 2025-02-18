package utils

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofrs/uuid/v5"
)

const (
	imageDir     = "./storage/avatars"
	MaxImageSize = 3 * 1024 * 1024
)

func SaveImage(base64Data string) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	if err := os.MkdirAll(imageDir, 0o755); err != nil {
		return "", err
	}

	parts := strings.Split(base64Data, ",")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid base64 format")
	}

	var imageType string
	if strings.Contains(parts[0], "image/jpeg") {
		imageType = "jpeg"
	} else if strings.Contains(parts[0], "image/png") {
		imageType = "png"
	} else if strings.Contains(parts[0], "image/gif") {
		imageType = "gif"
	} else {
		return "", fmt.Errorf("unsupported image format")
	}

	imgData, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return "", err
	}

	if len(imgData) > MaxImageSize {
		return "", fmt.Errorf("image size exceeds maximum allowed (3MB)")
	}

	filename := fmt.Sprintf("%s.%s", uuid.Must(uuid.NewV4()).String(), imageType)
	filepath := filepath.Join(imageDir, filename)
	
	if err := os.WriteFile(filepath, imgData, 0o644); err != nil {
		return "", err
	}

	return "storage/avatars/" + filename, nil
}
