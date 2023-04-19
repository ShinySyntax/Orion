package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"orion/internal/constants"
	"orion/internal/models"
	"strings"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetCertificateTransactionByID(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*models.CertificateTransaction, error) {
	transactionKey := strings.Join([]string{constants.CertificateTransactionModel, id}, "-")
	transactionBytes, err := ctx.GetStub().GetState(transactionKey)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state")
	}

	if transactionBytes == nil {
		return nil, fmt.Errorf("%s does not exist", transactionKey)
	}

	transaction := new(models.CertificateTransaction)
	_ = json.Unmarshal(transactionBytes, transaction)

	return transaction, nil
}

func (s *SmartContract) CreateCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
	id,
	originNIK,
	destinationNIK,
	secretKey string,
) error {
	if originNIK == destinationNIK {
		return errors.New("can't transfer certificate to the same user")
	}

	certificate, err := s.GetCertificateByID(ctx, id)
	if err != nil {
		return fmt.Errorf("certificate %s is not exist", id)
	}

	if certificate.NationalID != originNIK {
		return fmt.Errorf("certificate %s is not owned by %s", id, originNIK)
	}
	if certificate.IsInTransaction {
		return errors.New("can't transfer certificate, certificate is in transaction")
	}

	txID := ctx.GetStub().GetTxID()
	if _, err := s.GetCertificateTransactionByID(ctx, txID); err == nil {
		return fmt.Errorf("transaction key %s already used", txID)
	}

	timestamp, _ := ctx.GetStub().GetTxTimestamp()
	transaction := &models.CertificateTransaction{
		Base: models.Base{
			ModelName: constants.CertificateTransactionModel,
			ID:        strings.Join([]string{constants.CertificateTransactionModel, txID}, "-"),
		},
		CertificateID:      id,
		OldOwnerNationalID: originNIK,
		NewOwnerNationalID: destinationNIK,
		Status:             constants.InProgress,
		SecretKey:          secretKey,
		CreatedAt:          timestamp.String(),
	}

	transactionAsBytes, err := json.Marshal(transaction)
	if err != nil {
		return err
	}

	certificate.IsInTransaction = true
	certificateAsBytes, err := json.Marshal(certificate)
	if err != nil {
		return err
	}

	if err := ctx.GetStub().PutState(certificate.ID, certificateAsBytes); err != nil {
		return err
	}

	return ctx.GetStub().PutState(transaction.ID, transactionAsBytes)
}

func (s *SmartContract) ApproveCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
	txID,
	nik,
	secretKey string,
) error {
	certificateTx, err := s.GetCertificateTransactionByID(ctx, txID)
	if err != nil {
		return fmt.Errorf("certificate transaction %s is not exist", txID)
	}

	if certificateTx.NewOwnerNationalID != nik {
		return errors.New("user not eligible to accept transaction")
	}
	if certificateTx.Status != constants.InProgress {
		return errors.New("transaction can't be approved")
	}
	if certificateTx.SecretKey != secretKey {
		return errors.New("wrong secret key")
	}

	certificateTx.Status = constants.ApprovedByNewOwner
	certificateTxAsBytes, err := json.Marshal(certificateTx)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(certificateTx.ID, certificateTxAsBytes)
}

func (s *SmartContract) ProcessCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
	txID string,
) error {
	mspID, _ := cid.GetMSPID(ctx.GetStub())
	if mspID != constants.GovermentOrg {
		return errors.New("not eligible to process this certificate transaction, only goverment org are allowed")
	}

	certificateTx, err := s.GetCertificateTransactionByID(ctx, txID)
	if err != nil {
		return fmt.Errorf("certificate transaction %s is not exist", txID)
	}

	if certificateTx.Status != constants.ApprovedByNewOwner {
		return errors.New("transaction can't be accepted")
	}

	certificate, err := s.GetCertificateByID(ctx, certificateTx.CertificateID)
	if err != nil {
		return fmt.Errorf("certificate %s is not exist", certificateTx.CertificateID)
	}

	certificate.IsInTransaction = false
	certificate.NationalID = certificateTx.NewOwnerNationalID
	certificateTx.Status = constants.Success

	certificateTxAsBytes, err := json.Marshal(certificateTx)
	if err != nil {
		return err
	}

	certificateAsBytes, err := json.Marshal(certificate)
	if err != nil {
		return err
	}

	if err := ctx.GetStub().PutState(certificate.ID, certificateAsBytes); err != nil {
		return err
	}

	if err := ctx.GetStub().PutState(certificateTx.ID, certificateTxAsBytes); err != nil {
		return err
	}

	return nil
}

func (s *SmartContract) GetAllListTransactions(
	ctx contractapi.TransactionContextInterface,
) ([]*models.CertificateTransaction, error) {
	queryString := fmt.Sprintf(
		`{"selector":{"model_name":"%s"}}`,
		constants.CertificateTransactionModel,
	)
	transactionIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	var transactions []*models.CertificateTransaction
	for transactionIterator.HasNext() {
		transactionResponse, err := transactionIterator.Next()
		if err != nil {
			return nil, err
		}

		var transaction *models.CertificateTransaction
		err = json.Unmarshal(transactionResponse.Value, &transaction)
		if err != nil {
			return nil, err
		}
		transaction.SecretKey = "";
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

func (s *SmartContract) GetListTransactionsByStatus(
	ctx contractapi.TransactionContextInterface,
	status string,
) ([]*models.CertificateTransaction, error) {
	queryString := fmt.Sprintf(
		`{"selector":{"model_name":"%s","status":"%s"}}`,
		constants.CertificateTransactionModel,
		status,
	)
	transactionIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	var transactions []*models.CertificateTransaction
	for transactionIterator.HasNext() {
		transactionResponse, err := transactionIterator.Next()
		if err != nil {
			return nil, err
		}

		var transaction *models.CertificateTransaction
		err = json.Unmarshal(transactionResponse.Value, &transaction)
		if err != nil {
			return nil, err
		}
		transaction.SecretKey = "";
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

func (s *SmartContract) GetListTransactionsByNewOwnerNIK(
	ctx contractapi.TransactionContextInterface,
	nik string,
) ([]*models.CertificateTransaction, error) {
	queryString := fmt.Sprintf(
		`{"selector":{"model_name":"%s","new_owner_national_id":"%s"}}`,
		constants.CertificateTransactionModel,
		nik,
	)
	transactionIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	var transactions []*models.CertificateTransaction
	for transactionIterator.HasNext() {
		transactionResponse, err := transactionIterator.Next()
		if err != nil {
			return nil, err
		}

		var transaction *models.CertificateTransaction
		err = json.Unmarshal(transactionResponse.Value, &transaction)
		if err != nil {
			return nil, err
		}
		transaction.SecretKey = "";
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
