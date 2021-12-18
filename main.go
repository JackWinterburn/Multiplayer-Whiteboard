package main

import (
	"log"
	"net/http"
)

func main() {
	pool := newPool()

	go pool.run()

	http.Handle("/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
