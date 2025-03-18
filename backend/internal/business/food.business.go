package business

import (
	"errors"

	"toptal.com/calorysampleproject/internal/idgenerator"
	"toptal.com/calorysampleproject/internal/persist"
	"toptal.com/calorysampleproject/lib/food"
	"toptal.com/calorysampleproject/lib/token"
	"toptal.com/calorysampleproject/lib/user"
)

type (
	Business interface {
		Get(userIDs []user.ID, t token.Token) ([]food.Food, error)
		Add(f food.Food, t token.Token) (*food.Food, error)
		Delete(f food.ID, t token.Token) error
		Update(f food.Food, t token.Token) (*food.Food, error)
	}

	impl struct {
		persist     persist.FoodPersist
		idGenerator idgenerator.IDGenerator
	}
)

// quick checking the type respects the interface
var _ Business = (*impl)(nil)

func New(persist persist.FoodPersist, idGenerator idgenerator.IDGenerator) *impl {
	return &impl{persist: persist, idGenerator: idGenerator}
}

func (b *impl) Get(userIDs []user.ID, t token.Token) ([]food.Food, error) {
	if t.Role != token.RoleAdmin {
		if len(userIDs) != 1 || userIDs[0] != t.ID {
			return nil, &token.UnauthorizedError{}
		}
		return b.persist.GetByUserIDs(userIDs)
	}
	if len(userIDs) > 0 {
		return b.persist.GetByUserIDs(userIDs)
	}
	return b.persist.GetAll()
}

func (b *impl) Add(f food.Food, t token.Token) (*food.Food, error) {
	if t.Role != token.RoleAdmin && f.UserID != t.ID {
		return nil, &token.UnauthorizedError{}
	}

	//if the ID already exists, retry a few times
	i := 10
	for {
		f.ID = food.ID(b.idGenerator.ID())
		//now that we have an id, we can validate
		if err := f.Validate(); err != nil {
			return nil, err
		}
		f2, err := b.persist.Add(f)
		if !errors.Is(err, &food.FoodAlreadyExistsError{}) {
			return f2, err
		}
		i -= 1
		if i < 0 {
			panic("fail find id not taken")
		}
	}
}

func (b *impl) Update(f food.Food, t token.Token) (*food.Food, error) {
	if t.Role != token.RoleAdmin && f.UserID != t.ID {
		return nil, &token.UnauthorizedError{}
	}
	if err := f.Validate(); err != nil {
		return nil, err
	}
	return b.persist.Update(f)
}

func (b *impl) Delete(id food.ID, t token.Token) error {
	if t.Role != token.RoleAdmin {
		//Check if entry exist and is owned by user
		res, err := b.persist.GetByIDs([]food.ID{id})
		if err != nil {
			return err
		}
		//doesn't exist, nothing to do
		if len(res) != 1 {
			return nil
		}

		if res[0].UserID != t.ID {
			return &token.UnauthorizedError{}
		}
	}
	//if admin and non existent, also no error expected.

	return b.persist.Delete(id)
}
