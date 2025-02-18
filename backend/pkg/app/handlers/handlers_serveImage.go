package handlers

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

func ServeImages(w http.ResponseWriter, r *http.Request) {
	avatar := r.PathValue("avatar")
	if avatar == "" {
		http.NotFound(w, r)
		return
	}

	filePath := "./storage/avatars/" + avatar
	file, err := os.Open(filePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()

	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	http.ServeFile(w, r, filePath)
}
