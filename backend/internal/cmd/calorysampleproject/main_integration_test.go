package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"toptal.com/calorysampleproject/lib/food"
)

func TestMainIntegrationAsUser(t *testing.T) {
	port := "8081"
	os.Setenv("LISTEN_ADDR", ":"+port)
	go main()
	time.Sleep(1 * time.Millisecond) // Give the server a second to start

	client := &http.Client{}

	// Test Add Food
	foodNew := &food.Food{
		Timestamp: time.Unix(1000000, 0),
		Name:      "Banana",
		Calories:  105,
		Cheating:  false,
		UserID:    "John.Doe",
	}
	foodJSON, _ := json.Marshal(foodNew)
	req, err := http.NewRequest("POST", "http://localhost:"+port+"/api/foods", bytes.NewBuffer(foodJSON))
	req.Header.Set("Authorization", "Bearer token_John")
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("expected status 201, got %v", resp.StatusCode)
	}
	var createdFood food.Food
	err = json.NewDecoder(resp.Body).Decode(&createdFood)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Test Get All Foods
	req, err = http.NewRequest("GET", "http://localhost:"+port+"/api/foods", nil)
	q := req.URL.Query()
	q.Add("userIDs", "John.Doe")
	req.URL.RawQuery = q.Encode()
	req.Header.Set("Authorization", "Bearer token_John")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %v", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(body) == 0 {
		t.Errorf("expected non-empty response body")
	}

	// Test Update Food
	updatedFood := &food.Food{
		ID:        createdFood.ID,
		Timestamp: time.Unix(1000000, 0),
		Name:      "Banana",
		Calories:  110,
		Cheating:  true,
		UserID:    "John.Doe",
	}
	updatedFoodJSON, _ := json.Marshal(updatedFood)
	req, err = http.NewRequest("PUT", "http://localhost:"+port+"/api/foods/"+string(createdFood.ID), bytes.NewBuffer(updatedFoodJSON))
	req.Header.Set("Authorization", "Bearer token_John")
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %v", resp.StatusCode)
	}

	// Test Delete Food
	req, err = http.NewRequest("DELETE", "http://localhost:"+port+"/api/foods/"+string(createdFood.ID), nil)
	req.Header.Set("Authorization", "Bearer token_John")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %v", resp.StatusCode)
	}
}

func TestMainIntegrationAsError(t *testing.T) {
	port := "8082"
	os.Setenv("LISTEN_ADDR", ":"+port)
	go main()
	time.Sleep(1 * time.Millisecond) // Give the server a second to start

	client := &http.Client{}

	// Test Update Non-Existent Food
	nonExistentFood := &food.Food{
		ID:        "nonexistent",
		Timestamp: time.Unix(1000000, 0),
		Name:      "Apple",
		Calories:  95,
		Cheating:  false,
		UserID:    "John.Doe",
	}
	nonExistentFoodJSON, _ := json.Marshal(nonExistentFood)
	req, err := http.NewRequest("PUT", "http://localhost:"+port+"/api/foods/nonexistent", bytes.NewBuffer(nonExistentFoodJSON))
	req.Header.Set("Authorization", "Bearer token_John")
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("expected status 404, got %v", resp.StatusCode)
	}

	// Test Add Food in the Future
	foodFuture := &food.Food{
		Timestamp: time.Now().Add(24 * time.Hour), // 1 day in the future
		Name:      "Future Food",
		Calories:  150,
		Cheating:  false,
		UserID:    "John.Doe",
	}
	foodFutureJSON, _ := json.Marshal(foodFuture)
	req, err = http.NewRequest("POST", "http://localhost:"+port+"/api/foods", bytes.NewBuffer(foodFutureJSON))
	req.Header.Set("Authorization", "Bearer token_John")
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected status 400, got %v", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expectedBody := `{"Error":"FoodInvalidError, ID is required"}`
	if strings.TrimSpace(string(body)) != expectedBody {
		t.Errorf("expected body \nwant=%v\ngot =%v", expectedBody, string(body))
	}
}
