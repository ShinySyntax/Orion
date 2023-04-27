package models

type Certificate struct {
	Base
	SerialNumber       string `json:"serial_number"`
	RegistrationNumber string `json:"registration_number"`
	ChassisNumber      string `json:"chassis_number"`
	EngineNumber       string `json:"engine_number"`
	Brand              string `json:"brand"`
	Type               string `json:"type"`
	Category           string `json:"category"`
	Model              string `json:"model"`
	YearOfManufacture  string `json:"year_of_manufacture"`
	FuelType           string `json:"fuel_type"`
	NumberOfAxles      string `json:"number_of_axles"`
	NumberOfWheels     int    `json:"number_of_wheels"`
	Color              string `json:"color"`
	NationalID         string `json:"national_id"`
	Name               string `json:"name"`
	Address            string `json:"address"`
	IsInTransaction    bool   `json:"is_in_transaction"`
}

type CertificateHistory struct {
	TxId        string       `json:"tx_id"`
	Timestamp   string       `json:"timestamp"`
	Certificate *Certificate `json:"certificate"`
}
