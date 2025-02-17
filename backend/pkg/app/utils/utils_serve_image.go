package utils

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

func ServeAvatars(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	avatar := r.PathValue("avatar")
	if avatar == "" {
		SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	filePath := "./storage/avatars/" + avatar
	file, err := os.Open(filePath)
	if err != nil {
		SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	defer file.Close()

	// Detect MIME type based on file extension
	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	http.ServeFile(w, r, filePath)
}
