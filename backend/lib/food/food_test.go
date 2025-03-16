package food

import (
	"encoding/json"
	"testing"
	"time"
)

func TestFood_UnmarshalJSON(t *testing.T) {
	jsonData := []byte(`{"timestamp":1678901234567,"name":"Banana","calories":105,"cheating":false,"userId":"user1"}`)

	var f Food
	err := json.Unmarshal(jsonData, &f)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

}
func TestFood_MarshalJSON(t *testing.T) {
	f := &Food{
		ID:        "23",
		Timestamp: time.Unix(10000000, 0),
		Name:      "Banana",
		Calories:  105,
		Cheating:  false,
		UserID:    "user1",
	}

	jsonData, err := json.Marshal(f)
	if err != nil {
		t.Fatalf("Failed to marshal JSON: %v", err)
	}

	expectedJSON := `{"timestamp":10000000000,"id":"23","name":"Banana","calories":105,"cheating":false,"userId":"user1"}`
	if string(jsonData) != expectedJSON {
		t.Errorf("Expected JSON %s, but got %s", expectedJSON, string(jsonData))
	}
}
