package models

type User struct {
	ID    string `json:"id"`
	MspID string `json:"msp_id"`
	Role  string `json:"role"`
}
