package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"orion/internal/constants"
	"orion/internal/models"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetMaintenanceByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*models.Maintenance, error) {
	maintenanceKey := strings.Join([]string{constants.MaintenanceModel, id}, "-")
	maintenanceBytes, err := ctx.GetStub().GetState(maintenanceKey)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state")
	}

	if maintenanceBytes == nil {
		return nil, fmt.Errorf("%s does not exist", maintenanceKey)
	}

	maintenance := new(models.Maintenance)
	_ = json.Unmarshal(maintenanceBytes, maintenance)

	return maintenance, nil
}

func (s *SmartContract) AddMaintenanceHistory(
	ctx contractapi.TransactionContextInterface,
	id,
	vehicleCondition,
	vehicleDescription,
	serviceDescription,
	serviceLocation string,
) error {
	mspID, _ := cid.GetMSPID(ctx.GetStub())
	if mspID != constants.MaintenanceOrg {
		return errors.New("not eligible to add new maintenance, only maintenance org are allowed");
	}

	maintenance, err := s.GetMaintenanceByID(ctx, id)
	if errors.Is(err, fmt.Errorf("failed to read from world state")) {
		return err
	}

	if maintenance == nil {
		certificate, err := s.GetCertificateByID(ctx, id)
		if err != nil {
			return err
		}

		maintenance = &models.Maintenance{
			Base: models.Base{
				ModelName: constants.MaintenanceModel,
				ID:        strings.Join([]string{constants.MaintenanceModel, certificate.ChassisNumber}, "-"),
			},
			RegistrationNumber: certificate.RegistrationNumber,
			ChassisNumber:      certificate.ChassisNumber,
			EngineNumber:       certificate.EngineNumber,
		}
	}

	timestamp, _ := ctx.GetStub().GetTxTimestamp()

	maintenance.VehicleCondition = vehicleCondition
	maintenance.VehicleDescription = vehicleDescription
	maintenance.ServiceDescription = serviceDescription
	maintenance.ServiceLocation = serviceLocation
	maintenance.ServiceTime = timestamp.String()

	maintenanceAsBytes, err := json.Marshal(maintenance)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(maintenance.ID, maintenanceAsBytes)
}

func (s *SmartContract) GetListMaintenanceHistoryByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) ([]*models.MaintenanceHistory, error) {
	maintenanceKey := strings.Join([]string{constants.MaintenanceModel, id}, "-")
	maintenanceHistoryIterator, err := ctx.GetStub().GetHistoryForKey(maintenanceKey)
	if err != nil {
		return nil, err
	}
	defer maintenanceHistoryIterator.Close()

	var listMaintenanceHistory []*models.MaintenanceHistory
	for maintenanceHistoryIterator.HasNext() {
		res, err := maintenanceHistoryIterator.Next()
		if err != nil {
			return nil, err
		}

		var maintenance models.Maintenance
		if len(res.Value) > 0 {
			err = json.Unmarshal(res.Value, &maintenance)
			if err != nil {
				return nil, err
			}
		} else {
			maintenance = models.Maintenance{ChassisNumber: id}
		}

		listMaintenanceHistory = append(listMaintenanceHistory, &models.MaintenanceHistory{
			TxId:        res.TxId,
			Timestamp:   res.Timestamp.String(),
			Maintenance: &maintenance,
		})
	}

	return listMaintenanceHistory, nil
}
