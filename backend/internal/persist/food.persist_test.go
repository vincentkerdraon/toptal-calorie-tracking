package persist

import (
	"testing"

	"toptal.com/calorysampleproject/lib/food"
	"toptal.com/calorysampleproject/lib/user"
)

func TestFoodPersistMemory(t *testing.T) {
	persist := NewFoodPersistMemory()

	// Test Add
	f1 := food.Food{ID: "1", Name: "Apple", Calories: 95, UserID: "user1"}
	addedFood, err := persist.Add(f1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if addedFood.ID != f1.ID {
		t.Errorf("expected ID %v, got %v", f1.ID, addedFood.ID)
	}

	// Test GetAll
	allFoods, err := persist.GetAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(allFoods) != 1 {
		t.Errorf("expected 1 food, got %v", len(allFoods))
	}

	// Test Update
	f1Updated := food.Food{ID: "1", Name: "Green Apple", Calories: 100, UserID: "user1"}
	updatedFood, err := persist.Update(f1Updated)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if updatedFood.Name != f1Updated.Name {
		t.Errorf("expected name %v, got %v", f1Updated.Name, updatedFood.Name)
	}

	// Test GetByUserIDs
	userFoods, err := persist.GetByUserIDs([]user.ID{"user1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(userFoods) != 1 {
		t.Errorf("expected 1 food, got %v", len(userFoods))
	}

	// Test Delete
	err = persist.Delete(f1.ID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	allFoods, err = persist.GetAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(allFoods) != 0 {
		t.Errorf("expected 0 foods, got %v", len(allFoods))
	}
}
