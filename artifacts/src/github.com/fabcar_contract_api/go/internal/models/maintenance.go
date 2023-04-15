package models

type Maintenance struct {
	Base
	RegistrationNumber string `json:"registration_number"`
	ChassisNumber      string `json:"chassis_number"`
	EngineNumber       string `json:"engine_number"`
	VehicleCondition   string `json:"vehicle_condition"`
	VehicleDescription string `json:"vehicle_description"`
	ServiceDescription string `json:"service_description"`
	ServiceLocation    string `json:"service_location"`
	ServiceTime        string `json:"service_time"`
}

type MaintenanceHistory struct {
	TxId        string       `json:"tx_id"`
	Timestamp   string       `json:"timestamp"`
	Maintenance *Maintenance `json:"maintenance"`
}
