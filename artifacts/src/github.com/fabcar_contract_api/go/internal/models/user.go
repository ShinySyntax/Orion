package models

type User struct {
	Base
	NationalID     string `json:"national_id"`
	Name           string `json:"name"`
	Address        string `json:"address"`
	IsAuthorized   bool   `json:"is_authorized"`
	HashedPassword string `json:"hashed_password"`
}
