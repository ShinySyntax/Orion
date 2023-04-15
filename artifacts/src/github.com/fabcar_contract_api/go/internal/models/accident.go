package models

type Accident struct {
	Base
	RegistrationNumber string `json:"registration_number"`
	ChassisNumber      string `json:"chassis_number"`
	EngineNumber       string `json:"engine_number"`
	VehicleCondition   string `json:"vehicle_condition"`
	VehicleDescription string `json:"vehicle_description"`
	Location           string `json:"location"`
	OccurrenceTime     string `json:"occurrence_time"`
	Report             string `json:"report"`
	// VictimNationalID   string `json:"victim_national_id"`
	// VictimCondition    string `json:"victim_condition"`
}

type AccidentHistory struct {
	TxId      string    `json:"tx_id"`
	Timestamp string    `json:"timestamp"`
	Accident  *Accident `json:"certificate"`
}
