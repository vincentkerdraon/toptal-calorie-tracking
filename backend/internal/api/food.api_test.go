package api

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"topal.com/calorysampleproject/lib/food"
	"topal.com/calorysampleproject/lib/token"
	"topal.com/calorysampleproject/lib/user"
)

type mockBusiness struct {
	GetFunc    func(userIDs []user.ID, t token.Token) ([]food.Food, error)
	AddFunc    func(f food.Food, t token.Token) (*food.Food, error)
	DeleteFunc func(f food.ID, t token.Token) error
	UpdateFunc func(f food.Food, t token.Token) (*food.Food, error)
}

func (m *mockBusiness) Get(userIDs []user.ID, t token.Token) ([]food.Food, error) {
	if m.GetFunc != nil {
		return m.GetFunc(userIDs, t)
	}
	return nil, nil
}

func (m *mockBusiness) Add(f food.Food, t token.Token) (*food.Food, error) {
	if m.AddFunc != nil {
		return m.AddFunc(f, t)
	}
	return nil, nil
}

func (m *mockBusiness) Delete(f food.ID, t token.Token) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(f, t)
	}
	return nil
}

func (m *mockBusiness) Update(f food.Food, t token.Token) (*food.Food, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(f, t)
	}
	return nil, nil
}

func TestHandleFood_Add(t *testing.T) {
	mockBusiness := mockBusiness{
		AddFunc: func(f food.Food, t token.Token) (*food.Food, error) {
			f.ID = "id1"
			return &f, nil
		},
	}

	// Create a new HTTP request
	body := []byte(`{"timestamp":1678901234567,"name":"Banana","calories":105,"cheating":false,"userId":"user1"}`)
	req, err := http.NewRequest(http.MethodPost, "/api/foods", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Authorization", "Bearer token_user1")

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()

	// Create a handler function
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		HandleFood(w, r, &token.DecoderMock{}, &mockBusiness)
	})

	// Serve the HTTP request
	handler.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusCreated {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusCreated)
	}

	// Check the response body
	expectedBody := `{"timestamp":1678901234567,"id":"id1","name":"Banana","calories":105,"cheating":false,"userId":"user1"}`
	res := strings.TrimSpace(rr.Body.String())
	if res != expectedBody {
		t.Errorf("handler returned unexpected body: \ngot :%v\nwant:%v", res, expectedBody)
	}
}
