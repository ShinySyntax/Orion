package services

import (
	"encoding/json"
	"fmt"
	"strings"

	"orion/internal/constants"
	"orion/internal/models"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric/common/flogging"
)

type SmartContract struct {
	contractapi.Contract
}

var logger = flogging.MustGetLogger("orion")

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	logger.Info("Init ledger............")

	certificates := []models.Certificate{
		{
			SerialNumber:       "SN123456",
			RegistrationNumber: "B 8991 OUC",
			ChassisNumber:      "8AW204022K0011340",
			EngineNumber:       "2AZFE1234567",
			Brand:              "Toyota",
			Type:               "SUV",
			Category:           "Private",
			Model:              "Highlander",
			YearOfManufacture:  "2019",
			FuelType:           "Bensin",
			NumberOfAxles:      "2",
			NumberOfWheels:     4,
			Color:              "Putih",
			NationalID:         "3204091010901234",
			Name:               "Anisa Wijayanti",
			Address:            "Jl. Sukasari No. 20, Kel. Cibabat, Kec. Cimahi Utara, Kota Cimahi, Jawa Barat 40513",
		},
		{
			SerialNumber:       "SN234567",
			RegistrationNumber: "B 4138 HEA",
			ChassisNumber:      "MH8JA24T8KP000125",
			EngineNumber:       "2JZGTE0123456",
			Brand:              "Ford",
			Type:               "Pickup Truck",
			Category:           "Commercial",
			Model:              "F-150",
			YearOfManufacture:  "2020",
			FuelType:           "Diesel",
			NumberOfAxles:      "2",
			NumberOfWheels:     4,
			Color:              "Merah",
			NationalID:         "5403014210135678",
			Name:               "Aditya Putra Nugraha",
			Address:            "Jl. Pahlawan No. 23, RT. 06/RW. 02, Kel. Tegal Gundil, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50131",
		},
		{
			SerialNumber:       "SN345678",
			RegistrationNumber: "B 2294 WKN",
			ChassisNumber:      "MBH4SLC18LK765432",
			EngineNumber:       "LH564321",
			Brand:              "Honda",
			Type:               "Sedan",
			Category:           "Private",
			Model:              "Accord",
			YearOfManufacture:  "2021",
			FuelType:           "Hybrid",
			NumberOfAxles:      "2",
			NumberOfWheels:     4,
			Color:              "Hitam",
			NationalID:         "3401041108912345",
			Name:               "Tiara Dewi Lestari",
			Address:            "Jl. Imam Bonjol No. 05, RT. 03/RW. 01, Kel. Tanjung Mas, Kec. Pontianak Selatan, Kota Pontianak, Kalimantan Barat 78122",
		},
		{
			SerialNumber:       "SN456789",
			RegistrationNumber: "B 7202 WKK",
			ChassisNumber:      "MHF3LCC16LK987654",
			EngineNumber:       "EL789654",
			Brand:              "Chevrolet",
			Type:               "SUV",
			Category:           "Private",
			Model:              "Suburban",
			YearOfManufacture:  "2018",
			FuelType:           "Gasoline",
			NumberOfAxles:      "2",
			NumberOfWheels:     4,
			Color:              "Biru",
			NationalID:         "1107022505021234",
			Name:               "Iqbal Rahman Hakim",
			Address:            "Jl. Pemuda No. 28, RT. 08/RW. 04, Kel. Pasar Baru, Kec. Serang, Kota Serang, Banten 42111",
		},
	}

	for _, certificate := range certificates {
		certificate.ModelName = constants.CertificateModel
		certificate.ID = strings.Join([]string{constants.CertificateModel, certificate.ChassisNumber}, "-")

		certificateAsBytes, err := json.Marshal(certificate)
		if err != nil {
			return fmt.Errorf("failed to marshal certificate struct %s", err.Error())
		}

		if err := ctx.GetStub().PutState(certificate.ID, certificateAsBytes); err != nil {
			return fmt.Errorf("failed to put to world state. %s", err.Error())
		}
	}

	maintenances := []models.Maintenance{
		{
			RegistrationNumber: "B 8991 OUC",
			ChassisNumber:      "8AW204022K0011340",
			EngineNumber:       "2AZFE1234567",
			VehicleCondition:   "Rusak",
			VehicleDescription: "Turun mesin",
			ServiceDescription: "Full services",
			ServiceLocation:    "Jl. MT Haryono No. 77, Kel. Karet Kuningan, Kec. Setiabudi, Jakarta Selatan",
			ServiceTime:        "2022-06-15 13:30:00",
		},
		{
			RegistrationNumber: "B 4138 HEA",
			ChassisNumber:      "MH8JA24T8KP000125",
			EngineNumber:       "2JZGTE0123456",
			VehicleCondition:   "Baik",
			VehicleDescription: "Ban sedikit gembos",
			ServiceDescription: "Ganti oli mesin",
			ServiceLocation:    "Jl. Gajah Mada No. 42, Kel. Pekojan, Kec. Tambora, Jakarta Barat",
			ServiceTime:        "2022-09-20 10:00:00",
		},
		{
			RegistrationNumber: "B 2294 WKN",
			ChassisNumber:      "MBH4SLC18LK765432",
			EngineNumber:       "LH564321",
			VehicleCondition:   "Rusak",
			VehicleDescription: "Body pintu rusak",
			ServiceDescription: "Ganti oli mesin",
			ServiceLocation:    "Bengkel Cahaya Motor",
			ServiceTime:        "2023-04-13T10:00:00+07:00",
		},
		{
			RegistrationNumber: "B 7202 WKK",
			ChassisNumber:      "MHF3LCC16LK987654",
			EngineNumber:       "EL789654",
			VehicleCondition:   "Baik",
			VehicleDescription: "Semua baik",
			ServiceDescription: "Perbaikan sistem rem",
			ServiceLocation:    "Bengkel Berkat Jaya",
			ServiceTime:        "2023-04-14T09:30:00+07:00",
		},
	}

	for _, maintenance := range maintenances {
		maintenance.ModelName = constants.MaintenanceModel
		maintenance.ID = strings.Join([]string{constants.MaintenanceModel, maintenance.ChassisNumber}, "-")

		maintenanceAsBytes, err := json.Marshal(maintenance)
		if err != nil {
			return fmt.Errorf("failed to marshal maintenance struct %s", err.Error())
		}

		if err := ctx.GetStub().PutState(maintenance.ID, maintenanceAsBytes); err != nil {
			return fmt.Errorf("failed to put to world state. %s", err.Error())
		}
	}

	return nil
}
