package persist

import (
	"sync"

	"topal.com/calorysampleproject/lib/food"
	"topal.com/calorysampleproject/lib/user"
)

type (
	FoodPersist interface {
		GetByUserIDs([]user.ID) ([]food.Food, error)
		GetAll() ([]food.Food, error)
		GetByIDs([]food.ID) ([]food.Food, error)
		Add(f food.Food) (*food.Food, error)
		Delete(f food.ID) error
		Update(f food.Food) (*food.Food, error)
	}

	implMemory struct {
		m     sync.Mutex
		foods map[food.ID]food.Food
	}
)

// quick checking the type respects the interface
var _ FoodPersist = (*implMemory)(nil)

func NewFoodPersistMemory() *implMemory {
	return &implMemory{
		m:     sync.Mutex{},
		foods: make(map[food.ID]food.Food),
	}
}

func (im *implMemory) GetAll() ([]food.Food, error) {
	im.m.Lock()
	defer im.m.Unlock()

	var result []food.Food
	for _, f := range im.foods {
		result = append(result, f)
	}
	return result, nil
}

func (im *implMemory) GetByIDs(ids []food.ID) ([]food.Food, error) {
	im.m.Lock()
	defer im.m.Unlock()

	var result []food.Food

	for _, id := range ids {
		result = append(result, im.foods[id])
	}
	return result, nil
}

func (im *implMemory) GetByUserIDs(userIDs []user.ID) ([]food.Food, error) {
	im.m.Lock()
	defer im.m.Unlock()

	var result []food.Food
	for _, f := range im.foods {
		for _, id := range userIDs {
			if f.UserID == id {
				result = append(result, f)
				break
			}
		}
	}
	return result, nil
}

func (im *implMemory) Add(f food.Food) (*food.Food, error) {
	im.m.Lock()
	defer im.m.Unlock()

	if _, exists := im.foods[f.ID]; exists {
		return nil, &food.FoodAlreadyExistsError{}
	}

	im.foods[f.ID] = f
	return &f, nil
}

// Delete. No error if missing.
func (im *implMemory) Delete(id food.ID) error {
	im.m.Lock()
	defer im.m.Unlock()

	delete(im.foods, id)
	return nil
}

func (im *implMemory) Update(f food.Food) (*food.Food, error) {
	im.m.Lock()
	defer im.m.Unlock()

	found, exists := im.foods[f.ID]
	if !exists {
		return nil, &food.FoodNotFoundError{}
	}
	if found.ID != f.ID {
		return nil, &food.FoodInvalidEditError{}
	}

	im.foods[f.ID] = f
	return &f, nil
}
