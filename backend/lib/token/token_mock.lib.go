package token

import (
	"fmt"
)

// SampleProject: fake data
type DecoderMock struct{}

func (*DecoderMock) Decode(tokenEncoded TokenEncoded) (*Token, error) {
	tokens := map[TokenEncoded]*Token{
		"token_John":    {ID: "John.Doe", Role: RoleUser},
		"token_Jane":    {ID: "Jane.Smith", Role: RoleUser},
		"token_Emily":   {ID: "Emily.Davis", Role: RoleUser},
		"token_Jessica": {ID: "Jessica.Martinez", Role: RoleAdmin},
		"token_Barbara": {ID: "Barbara.White", Role: RoleAdmin},
	}

	token, exists := tokens[tokenEncoded]
	if !exists {
		return nil, fmt.Errorf("token not found")
	}
	return token, nil
}
