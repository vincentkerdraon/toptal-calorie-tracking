package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"toptal.com/calorysampleproject/internal/api"
	"toptal.com/calorysampleproject/internal/business"
	"toptal.com/calorysampleproject/internal/idgenerator"
	"toptal.com/calorysampleproject/internal/persist"
	"toptal.com/calorysampleproject/lib/food"
	"toptal.com/calorysampleproject/lib/token"
)

func main() {
	listenAddress := os.Getenv("LISTEN_ADDR")
	if listenAddress == "" {
		listenAddress = ":8080"
	}

	go func() {
		//database
		persist := persist.NewFoodPersistMemory()
		populateFoodDataMock(persist)

		//inject the database layer into the business layer
		bus := business.New(persist, &idgenerator.GoogleUUID{})

		//inject the business layer into the api layer
		handleFood := func(w http.ResponseWriter, r *http.Request) {
			api.HandleFood(w, r, &token.DecoderMock{}, bus)
		}
		handleFoodWithCORS := api.CORS(http.HandlerFunc(handleFood))
		fmt.Printf("running server on %q\n", listenAddress)
		err := http.ListenAndServe(listenAddress, handleFoodWithCORS)
		if err != http.ErrServerClosed {
			panic(err)
		}
	}()

	//listen for ctrl+c
	stop := make(chan os.Signal, 1)
	<-stop
	fmt.Println("Shutting down server...")
}

func populateFoodDataMock(persist persist.FoodPersist) {
	add := func(f food.Food) {
		_, err := persist.Add(f)
		if err != nil {
			panic(err)
		}
	}

	add(food.Food{
		ID:        "foodId001",
		Timestamp: time.Now().UTC(),
		Name:      "Chocolate",
		Calories:  100,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId002",
		Timestamp: time.Now().UTC(),
		Name:      "Ice Cream",
		Calories:  200,
		Cheating:  true,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId003",
		Timestamp: time.Now().UTC(),
		Name:      "Chicken",
		Calories:  300,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId004",
		Timestamp: time.Now().UTC().Add(-24 * time.Hour),
		Name:      "Chicken",
		Calories:  400,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId005",
		Timestamp: time.Now().UTC().Add(-24 * 2 * time.Hour),
		Name:      "Chicken",
		Calories:  500,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId006",
		Timestamp: time.Now().UTC().Add(-24 * 2 * time.Hour),
		Name:      "Chicken",
		Calories:  600,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId007",
		Timestamp: time.Now().UTC().Add(-24 * 8 * time.Hour),
		Name:      "Chicken",
		Calories:  700,
		Cheating:  false,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId008",
		Timestamp: time.Now().UTC().Add(-24 * 8 * time.Hour),
		Name:      "Ice Cream",
		Calories:  200,
		Cheating:  true,
		UserID:    "John.Doe",
	})
	add(food.Food{
		ID:        "foodId009",
		Timestamp: time.Now().UTC(),
		Name:      "Chocolate",
		Calories:  100,
		Cheating:  false,
		UserID:    "Jane.Smith",
	})

	for i := 100; i <= 130; i++ {
		_, err := persist.Add(food.Food{
			ID:        food.ID(fmt.Sprintf("foodId%d", i)),
			Timestamp: time.Now().UTC().Add(time.Duration(i) * -24 * time.Hour),
			Name:      fmt.Sprintf("FoodItem%d", i),
			Calories:  100 * i,
			Cheating:  i%2 == 0,
			UserID:    "Emily.Davis",
		})
		if err != nil {
			panic(err)
		}
	}
}
