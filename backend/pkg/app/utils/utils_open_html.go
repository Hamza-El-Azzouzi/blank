package utils

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"text/template"
)

func OpenHtml(fileName string, w http.ResponseWriter, data string) {
	temp, err := template.ParseFiles("./templates/" + fileName)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if data == "404" {
		w.WriteHeader(http.StatusNotFound)
	}
	err = temp.Execute(w, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func SetupStaticFilesHandlers(w http.ResponseWriter, r *http.Request) {
	defer func() {
		err := recover()
		if err != nil {
			OpenHtml("index.html", w, "404")
		}
	}()

	fileinfo, err := os.Stat("../" + r.URL.Path)
	if !os.IsNotExist(err) && !fileinfo.IsDir() {
		http.FileServer(http.Dir("../")).ServeHTTP(w, r)
	} else {
		OpenHtml("index.html", w, "404")
	}
}

func ServeAvatars(w http.ResponseWriter, r *http.Request) {
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

	// Detect MIME type based on file extension
	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	// Serve the file
	http.ServeFile(w, r, filePath)
}
