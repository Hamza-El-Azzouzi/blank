package handlers

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"

	"blank/pkg/app/utils"
)

func ServeImages(w http.ResponseWriter, r *http.Request) {
	avatar := r.PathValue("avatar")
	if avatar == "" {
		utils.SendResponses(w, http.StatusNotFound, "Image Not Found", nil)
		return
	}

	filePath := "./storage/avatars/" + avatar
	file, err := os.Open(filePath)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Image Not Found", nil)
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
