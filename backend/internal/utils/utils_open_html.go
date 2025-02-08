package utils

import (
	"net/http"
	"os"
	"text/template"
)

func OpenHtml(fileName string, w http.ResponseWriter, data string) {
	temp, err := template.ParseFiles("../templates/" + fileName)
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
