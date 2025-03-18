package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"toptal.com/calorysampleproject/internal/business"
	"toptal.com/calorysampleproject/lib/food"
	"toptal.com/calorysampleproject/lib/token"
	"toptal.com/calorysampleproject/lib/user"
)

func HandleFood(w http.ResponseWriter, r *http.Request, tokenDecoder token.Decoder, bus business.Business) {
	authS := r.Header.Get("Authorization")
	tokenS, f := strings.CutPrefix(authS, "Bearer ")
	if !f || tokenS == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	//SampleProject only. On a real project, this is decoding a JWT token or calling a service to do it
	tokenDecoded, err := tokenDecoder.Decode(token.TokenEncoded(tokenS))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var res any
	var code int
	switch r.Method {
	case http.MethodPost:
		code, res, err = handleAdd(r, bus, *tokenDecoded)
	case http.MethodPut:
		code, res, err = handleUpdate(r, bus, *tokenDecoded)
	case http.MethodGet:
		code, res, err = handleList(r, bus, *tokenDecoded)
	case http.MethodDelete:
		code, res, err = handleDelete(r, bus, *tokenDecoded)
	default:
		panic(r.Method)
	}

	//For some errors, it helps to forward them to the client.
	//but careful what we expose
	if err != nil {
		if res = forwardFunctionalErrors(err); res != nil {
			code = http.StatusBadRequest
			err = nil
		}
	}

	if err != nil {
		if errors.Is(err, &token.UnauthorizedError{}) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		//not a user error, important to report and fix
		fmt.Printf("InternalServerError: %s %s %+v,%s\n", r.Method, r.URL.Path, *tokenDecoded, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(code)
	if res != nil {
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(res)
		if err != nil {
			//not a user error, important to report and fix
			fmt.Printf("fail JSON encode answer: %s %s %+v, %+v%s\n", r.Method, r.URL.Path, *tokenDecoded, res, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}

func forwardFunctionalErrors(err error) any {

	FoodNotFoundError := &food.FoodNotFoundError{}
	if errors.As(err, &FoodNotFoundError) {
		return food.NewErrorReturnAPI(FoodNotFoundError)
	}
	FoodAlreadyExistsError := &food.FoodAlreadyExistsError{}
	if errors.As(err, &FoodAlreadyExistsError) {
		return food.NewErrorReturnAPI(FoodAlreadyExistsError)
	}
	FoodInvalidEditError := &food.FoodInvalidEditError{}
	if errors.As(err, &FoodInvalidEditError) {
		return food.NewErrorReturnAPI(FoodInvalidEditError)
	}
	FoodInvalidError := &food.FoodInvalidError{}
	if errors.As(err, &FoodInvalidError) {
		return food.NewErrorReturnAPI(FoodInvalidError)
	}
	return nil
}

func handleDelete(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, any, error) {
	id, f := strings.CutPrefix(r.URL.Path, food.BaseAPI+"/")
	if !f {
		return http.StatusBadRequest, nil, nil
	}
	if id == "" {
		return http.StatusBadRequest, nil, nil
	}

	return http.StatusOK, nil, bus.Delete(food.ID(id), tokenDecoded)
}

func handleList(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, any, error) {
	if r.URL.Path != food.BaseAPI {
		return http.StatusBadRequest, nil, nil
	}

	var userIDs []user.ID
	query := r.URL.Query()
	for _, id := range query["userIDs"] {
		userIDs = append(userIDs, user.ID(id))
	}
	res, err := bus.Get(userIDs, tokenDecoded)
	return http.StatusOK, res, err
}

func handleUpdate(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, any, error) {
	id, f := strings.CutPrefix(r.URL.Path, food.BaseAPI+"/")
	if !f {
		return http.StatusBadRequest, nil, nil
	}
	if id == "" {
		return http.StatusBadRequest, nil, nil
	}

	var newFood food.Food
	err := json.NewDecoder(r.Body).Decode(&newFood)
	if err != nil {
		return http.StatusBadRequest, nil, nil
	}
	if newFood.ID != food.ID(id) {
		return http.StatusBadRequest, nil, nil
	}

	res, err := bus.Update(newFood, tokenDecoded)
	if errors.Is(err, &food.FoodNotFoundError{}) {
		return http.StatusNotFound, nil, nil
	}
	return http.StatusOK, res, err
}

func handleAdd(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, any, error) {
	if r.URL.Path != food.BaseAPI {
		return http.StatusBadRequest, nil, nil
	}

	var newFood = &food.Food{}
	err := json.NewDecoder(r.Body).Decode(newFood)
	if err != nil {
		return http.StatusBadRequest, nil, nil
	}

	res, err := bus.Add(*newFood, tokenDecoded)
	return http.StatusCreated, res, err
}
