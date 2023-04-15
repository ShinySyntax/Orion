package services

import (
	"encoding/json"
	"fmt"
	"orion/internal/constants"
	"orion/internal/models"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)


func (s *SmartContract) GetCertificateByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*models.Certificate, error) {
	// stub := ctx.GetStub()

	// mspID, _ := cid.GetMSPID(stub)
  // userID, _ := cid.GetID(stub)
  // value, found, _ := cid.GetAttributeValue(stub, "role")

	logger.Info("fetch certificate..........")
	// logger.Info(mspID, userID, value, found)

	certificateKey := strings.Join([]string{constants.CertificateModel, id}, "-")
	certificateBytes, err := ctx.GetStub().GetState(certificateKey)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state. %s", err.Error())
	}

	if certificateBytes == nil {
		return nil, fmt.Errorf("%s does not exist", certificateKey)
	}

	certificate := new(models.Certificate)
	_ = json.Unmarshal(certificateBytes, certificate)

	return certificate, nil
}

func (s *SmartContract) GetListCertificateByNIK(
	ctx contractapi.TransactionContextInterface,
	nik string,
) ([]*models.Certificate, error) {
	queryString := fmt.Sprintf(
		`{"selector":{"model_name":"%s","national_id":"%s"}}`,
		constants.CertificateModel,
		nik,
	)
	certificateIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	var certificates []*models.Certificate
	for certificateIterator.HasNext() {
		certificateResponse, err := certificateIterator.Next()
		if err != nil {
			return nil, err
		}

		var certificate *models.Certificate
		err = json.Unmarshal(certificateResponse.Value, &certificate)
		if err != nil {
			return nil, err
		}
		certificates = append(certificates, certificate)
	}

	return certificates, nil
}

func (s *SmartContract) GetListCertificateHistoryByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) ([]*models.CertificateHistory, error) {
	certificateKey := strings.Join([]string{constants.CertificateModel, id}, "-")
	certificateHistoryIterator, err := ctx.GetStub().GetHistoryForKey(certificateKey)
	if err != nil {
		return nil, err
	}
	defer certificateHistoryIterator.Close()

	var listCertificateHistory []*models.CertificateHistory
	for certificateHistoryIterator.HasNext() {
		res, err := certificateHistoryIterator.Next()
		if err != nil {
			return nil, err
		}

		var certificate models.Certificate
		if len(res.Value) > 0 {
			err = json.Unmarshal(res.Value, &certificate)
			if err != nil {
				return nil, err
			}
		} else {
			certificate = models.Certificate{ChassisNumber: id}
		}

		listCertificateHistory = append(listCertificateHistory, &models.CertificateHistory{
			TxId:        res.TxId,
			Timestamp:   res.Timestamp.String(),
			Certificate: &certificate,
		})
	}

	return listCertificateHistory, nil
}
