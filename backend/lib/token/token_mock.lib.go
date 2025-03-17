package token

import (
	"fmt"
)

// SampleProject: fake data
type DecoderMock struct{}

func (*DecoderMock) Decode(tokenEncoded TokenEncoded) (*Token, error) {
	tokens := map[TokenEncoded]*Token{
		"token_user1":  {ID: "user1", Name: "user1", Role: RoleUser},
		"token_user2":  {ID: "user2", Name: "user2", Role: RoleUser},
		"token_user3":  {ID: "user3", Name: "user3", Role: RoleUser},
		"token_admin1": {ID: "admin1", Name: "admin1", Role: RoleAdmin},
		"token_admin2": {ID: "admin2", Name: "admin2", Role: RoleAdmin},
	}

	token, exists := tokens[tokenEncoded]
	if !exists {
		return nil, fmt.Errorf("token not found")
	}
	return token, nil
}
