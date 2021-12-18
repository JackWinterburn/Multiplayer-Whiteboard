package main

import (
	"bytes"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	pool *Pool
	conn *websocket.Conn
	send chan []byte
}

// Pumps messages from client to server
func (c *Client) readPump() {
	defer func() {
		c.pool.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("%v", err)
			}
			break
		}
		message = bytes.TrimSpace(message)
		c.pool.broadcast <- message
	}
}

// Pumps messages from server to all clients
func (c *Client) writePump() {
	message, ok := <-c.send
	if !ok {
		// The hub closed the channel.
		c.conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	w, err := c.conn.NextWriter(websocket.TextMessage)
	if err != nil {
		return
	}
	w.Write(message)

	// Add queued chat messages to the current websocket message.
	n := len(c.send)
	for i := 0; i < n; i++ {
		w.Write(<-c.send)
	}

	if err := w.Close(); err != nil {
		return
	}
}

func serveWs(pool *Pool, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{pool: pool, conn: conn, send: make(chan []byte, 256)}
	client.pool.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
