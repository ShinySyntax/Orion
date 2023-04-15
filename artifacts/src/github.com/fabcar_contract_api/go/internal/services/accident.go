package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"orion/internal/constants"
	"orion/internal/models"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetAccidentByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*models.Accident, error) {
	accidentKey := strings.Join([]string{constants.AccidentModel, id}, "-")
	accidentBytes, err := ctx.GetStub().GetState(accidentKey)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state")
	}

	if accidentBytes == nil {
		return nil, fmt.Errorf("%s does not exist", accidentKey)
	}

	accident := new(models.Accident)
	_ = json.Unmarshal(accidentBytes, accident)

	return accident, nil
}

func (s *SmartContract) AddAccidentHistory(
	ctx contractapi.TransactionContextInterface,
	id,
	vehicleCondition,
	vehicleDescription,
	location,
	occurenceTime,
	report string,
) error {
	accident, err := s.GetAccidentByID(ctx, id)
	if errors.Is(err, fmt.Errorf("failed to read from world state")) {
		return err
	}

	if accident == nil {
		certificate, err := s.GetCertificateByID(ctx, id)
		if err != nil {
			return err
		}

		accident = &models.Accident{
			Base: models.Base{
				ModelName: constants.AccidentModel,
				ID:        strings.Join([]string{constants.AccidentModel, certificate.ChassisNumber}, "-"),
			},
			RegistrationNumber: certificate.RegistrationNumber,
			ChassisNumber:      certificate.ChassisNumber,
			EngineNumber:       certificate.EngineNumber,
		}
	}

	accident.VehicleCondition = vehicleCondition
	accident.VehicleDescription = vehicleDescription
	accident.Location = location
	accident.OccurrenceTime = occurenceTime
	accident.Report = report

	accidentAsBytes, err := json.Marshal(accident)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(accident.ID, accidentAsBytes)
}

func (s *SmartContract) GetListAccidentHistoryByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) ([]*models.AccidentHistory, error) {
	accidentKey := strings.Join([]string{constants.AccidentModel, id}, "-")
	accidentHistoryIterator, err := ctx.GetStub().GetHistoryForKey(accidentKey)
	if err != nil {
		return nil, err
	}
	defer accidentHistoryIterator.Close()

	var listAccidentHistory []*models.AccidentHistory
	for accidentHistoryIterator.HasNext() {
		res, err := accidentHistoryIterator.Next()
		if err != nil {
			return nil, err
		}

		var accident models.Accident
		if len(res.Value) > 0 {
			err = json.Unmarshal(res.Value, &accident)
			if err != nil {
				return nil, err
			}
		} else {
			accident = models.Accident{ChassisNumber: id}
		}

		listAccidentHistory = append(listAccidentHistory, &models.AccidentHistory{
			TxId:      res.TxId,
			Timestamp: res.Timestamp.String(),
			Accident:  &accident,
		})
	}

	return listAccidentHistory, nil
}
