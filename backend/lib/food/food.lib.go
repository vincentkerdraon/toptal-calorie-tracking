package food

import (
	"encoding/json"
	"fmt"
	"time"

	"toptal.com/calorysampleproject/lib/user"
)

type ID string

type Food struct {
	ID        ID        `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Name      string    `json:"name"`
	Calories  int       `json:"calories"`
	Cheating  bool      `json:"cheating"`
	UserID    user.ID   `json:"userId"`
}

// Custom JSON encode for Timestamp
func (f *Food) MarshalJSON() ([]byte, error) {
	type Alias Food
	return json.Marshal(&struct {
		Timestamp int64 `json:"timestamp"`
		*Alias
	}{
		Timestamp: f.Timestamp.UTC().UnixNano() / int64(time.Millisecond),
		Alias:     (*Alias)(f),
	})
}

// Custom JSON decode for Timestamp
func (f *Food) UnmarshalJSON(data []byte) error {
	type Alias Food
	aux := &struct {
		Timestamp int64 `json:"timestamp"`
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, aux); err != nil {
		return err
	}
	f.Timestamp = time.Unix(0, aux.Timestamp*int64(time.Millisecond)).UTC()
	return nil
}

func (f *Food) Validate() *FoodInvalidError {
	if f.ID == "" {
		return &FoodInvalidError{reason: "ID is required"}
	}
	if f.Name == "" {
		return &FoodInvalidError{reason: "Name is required"}
	}
	if f.UserID == "" {
		return &FoodInvalidError{reason: "UserID is required"}
	}
	if f.Calories < 0 {
		return &FoodInvalidError{reason: "Calories must be greater than zero"}
	}
	if f.Timestamp.After(time.Now()) {
		return &FoodInvalidError{reason: "Date must be past or present"}
	}
	return nil
}

type FoodInvalidError struct {
	reason string
}

func (e *FoodInvalidError) Error() string {
	return fmt.Sprintf("FoodInvalidError, %s", e.reason)
}

type FoodNotFoundError struct{}

func (e *FoodNotFoundError) Error() string {
	return "FoodNotFound"
}

type FoodAlreadyExistsError struct{}

func (e *FoodAlreadyExistsError) Error() string {
	return "FoodAlreadyExists"
}

type FoodInvalidEditError struct{}

func (e *FoodInvalidEditError) Error() string {
	return "FoodInvalidEdit"
}

type GetInput struct {
	UserIDs []user.ID `json:"userIDs"`
}

const BaseAPI = "/api/foods"

type ErrorReturnAPI struct {
	Error string
}

func NewErrorReturnAPI(err error) ErrorReturnAPI {
	return ErrorReturnAPI{Error: err.Error()}
}
