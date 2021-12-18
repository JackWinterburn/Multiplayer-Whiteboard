package main

import (
	"fmt"
	"log"
	"net/http"
)

func serveWs(pool *Pool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("WebSocket Endpoint Hit")
	conn, err := Upgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
	}

	client := &Client{
		Conn: conn,
		Pool: pool,
	}

	pool.Register <- client
	client.Read()
}

func main() {
	pool := NewPool()
	go pool.Start()

	http.Handle("/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
