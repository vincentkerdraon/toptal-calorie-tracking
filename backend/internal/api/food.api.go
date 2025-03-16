package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"topal.com/calorysampleproject/internal/business"
	"topal.com/calorysampleproject/lib/food"
	"topal.com/calorysampleproject/lib/token"
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

	var res interface{}
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

	if res != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		err = json.NewEncoder(w).Encode(res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}

func handleDelete(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, interface{}, error) {
	if !strings.HasPrefix(r.URL.Path+"/", food.BaseAPI) {
		return http.StatusBadRequest, nil, nil
	}
	id := r.URL.Path[len(food.BaseAPI+"/"):]
	if id == "" {
		return http.StatusBadRequest, nil, nil
	}

	return http.StatusOK, nil, bus.Delete(food.ID(id), tokenDecoded)
}

func handleList(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, interface{}, error) {
	if r.URL.Path != food.BaseAPI {
		return http.StatusBadRequest, nil, nil
	}

	in := food.GetInput{}
	err := json.NewDecoder(r.Body).Decode(&in)
	if err != nil {
		return http.StatusBadRequest, nil, nil
	}

	res, err := bus.Get(in.UserIDs, tokenDecoded)
	return http.StatusOK, res, err
}

func handleUpdate(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, interface{}, error) {
	if r.URL.Path != food.BaseAPI {
		return http.StatusBadRequest, nil, nil
	}

	var newFood food.Food
	err := json.NewDecoder(r.Body).Decode(&newFood)
	if err != nil {
		return http.StatusBadRequest, nil, nil
	}

	res, err := bus.Update(newFood, tokenDecoded)
	return http.StatusOK, res, err
}

func handleAdd(r *http.Request, bus business.Business, tokenDecoded token.Token) (int, interface{}, error) {
	if r.URL.Path != food.BaseAPI {
		return http.StatusBadRequest, nil, nil
	}

	var newFood food.Food
	err := json.NewDecoder(r.Body).Decode(&newFood)
	if err != nil {
		return http.StatusBadRequest, nil, nil
	}

	res, err := bus.Add(newFood, tokenDecoded)
	return http.StatusCreated, res, err
}
