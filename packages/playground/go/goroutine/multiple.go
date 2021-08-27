package main

import (
	"fmt"
)

func numbers() {
	for i := 1; i <= 5; i++ {
		// time.Sleep(250 * time.Millisecond)
		fmt.Printf("%d ", i)
	}
}
func alphabets() {
	for i := 'a'; i <= 'e'; i++ {
		// time.Sleep(400 * time.Millisecond)
		fmt.Printf("%c ", i)
	}
}
func main() {
	go numbers()
	go alphabets()
	// time.Sleep(3000 * time.Millisecond)
	fmt.Println("main terminated")
}

// outputs : 1 a 2 3 b 4 c 5 d e main terminated
