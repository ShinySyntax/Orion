package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"orion/internal/constants"
	"orion/internal/models"
	"orion/internal/utils"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetCertificateTransactionByID(
	ctx contractapi.TransactionContextInterface,
	txID string,
) (*models.CertificateTransaction, error) {
	txKey := strings.Join([]string{constants.CertificateTransactionModel, txID}, "-")
	txAsBytes, err := ctx.GetStub().GetPrivateData(constants.CollectionTransaction, txKey)

	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %v", err)
	}

	if txAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", txKey)
	}

	tx := new(models.CertificateTransaction)
	_ = json.Unmarshal(txAsBytes, tx)

	return tx, nil
}

func (s *SmartContract) CreateCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
) error {
	// Get new asset from transient map.
	transientMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("error getting transient: %v", err)
	}

	// Transaction properties are private, therefore they get passed in transient field, instead of func args.
	transientTransactionJSON, ok := transientMap["transaction_properties"]
	if !ok {
		return fmt.Errorf("asset not found in the transient map input")
	}

	type transactionTransientInput struct {
		CertificateID     string `json:"certificate_id"`
		OriginNIK         string `json:"origin_nik"`
		DestinationNIK    string `json:"destination_nik"`
		SecretKey         string `json:"secret_key"`
		TransactionDetail string `json:"transaction_detail"`
	}

	var txInput transactionTransientInput
	err = json.Unmarshal(transientTransactionJSON, &txInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	// Basic validation.
	if len(txInput.CertificateID) == 0 {
		return fmt.Errorf("certificate_id field must be a non-empty string")
	}
	if len(txInput.OriginNIK) == 0 {
		return fmt.Errorf("origin_nik field must be a non-empty string")
	}
	if len(txInput.DestinationNIK) == 0 {
		return fmt.Errorf("destination_nik field must be a non-empty string")
	}
	if len(txInput.SecretKey) == 0 {
		return fmt.Errorf("secret_key field must be a non-empty string")
	}
	if len(txInput.TransactionDetail) == 0 {
		return fmt.Errorf("transaction_detail must be a non-empty string")
	}

	// Check if asset already exists
	txID := ctx.GetStub().GetTxID()
	txAsBytes, err := ctx.GetStub().GetPrivateData(constants.CollectionTransaction, txID)
	if err != nil {
		return fmt.Errorf("failed to get transaction: %v", err)
	} else if txAsBytes != nil {
		logger.Info("Transaction already exists: " + txID)
		return fmt.Errorf("this transaction already exists: " + txID)
	}

	// Business logic validation.

	if txInput.OriginNIK == txInput.DestinationNIK {
		return errors.New("can't transfer certificate to the same user")
	}

	certificate, err := s.GetCertificateByID(ctx, txInput.CertificateID)
	if err != nil {
		return fmt.Errorf("certificate %s is not exist", txInput.CertificateID)
	}

	if certificate.NationalID != txInput.OriginNIK {
		return fmt.Errorf("certificate %s is not owned by %s", txInput.CertificateID, txInput.OriginNIK)
	}
	if certificate.IsInTransaction {
		return errors.New("can't transfer certificate, certificate is in transaction")
	}

	timestamp, _ := ctx.GetStub().GetTxTimestamp()
	transaction := &models.CertificateTransaction{
		Base: models.Base{
			ModelName: constants.CertificateTransactionModel,
			ID:        strings.Join([]string{constants.CertificateTransactionModel, txID}, "-"),
		},
		CertificateID:      txInput.CertificateID,
		OldOwnerNationalID: txInput.OriginNIK,
		NewOwnerNationalID: txInput.DestinationNIK,
		Status:             constants.InProgress,
		SecretKey:          txInput.SecretKey,
		CreatedAt:          timestamp.String(),
	}
	transactionDetail := &models.CertificateTransactionDetail{
		Base: models.Base{
			ModelName: constants.CertificateTransactionDetailModel,
			ID:        strings.Join([]string{constants.CertificateTransactionDetailModel, txID}, "-"),
		},
		Detail: txInput.TransactionDetail,
	}

	transactionAsBytes, err := json.Marshal(transaction)
	if err != nil {
		return err
	}

	transactionDetailAsBytes, err := json.Marshal(transactionDetail)
	if err != nil {
		return err
	}

	certificate.IsInTransaction = true
	certificateAsBytes, err := json.Marshal(certificate)
	if err != nil {
		return err
	}

	if err := ctx.GetStub().PutPrivateData(constants.CollectionTransaction, transaction.ID, transactionAsBytes); err != nil {
		return err
	}

	if err := ctx.GetStub().PutPrivateData(constants.CollectionTransactionDetail, transactionDetail.ID, transactionDetailAsBytes); err != nil {
		return err
	}

	if err := ctx.GetStub().PutState(certificate.ID, certificateAsBytes); err != nil {
		return err
	}

	return nil
}

func (s *SmartContract) ApproveCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
) error {
	// Get new asset from transient map.
	transientMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("error getting transient: %v", err)
	}

	// Transaction properties are private, therefore they get passed in transient field, instead of func args.
	transientTransactionJSON, ok := transientMap["transaction_properties"]
	if !ok {
		return fmt.Errorf("asset not found in the transient map input")
	}

	type transactionTransientInput struct {
		TransactionID string `json:"transaction_id"`
		NIK           string `json:"nik"`
		SecretKey     string `json:"secret_key"`
	}

	var txInput transactionTransientInput
	err = json.Unmarshal(transientTransactionJSON, &txInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	certificateTx, err := s.GetCertificateTransactionByID(ctx, txInput.TransactionID)
	if err != nil {
		return fmt.Errorf("certificate transaction %s is not exist", txInput.TransactionID)
	}

	if certificateTx.NewOwnerNationalID != txInput.NIK {
		return errors.New("user not eligible to accept transaction")
	}
	if certificateTx.Status != constants.InProgress {
		return errors.New("transaction can't be approved")
	}
	if certificateTx.SecretKey != txInput.SecretKey {
		return errors.New("wrong secret key")
	}

	certificateTx.Status = constants.ApprovedByNewOwner
	certificateTxAsBytes, err := json.Marshal(certificateTx)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutPrivateData(constants.CollectionTransaction, certificateTx.ID, certificateTxAsBytes)
}

func (s *SmartContract) ProcessCertificateTransaction(
	ctx contractapi.TransactionContextInterface,
) error {
	if err := utils.IsAuthorize(ctx, constants.GovermentOrg); err != nil {
		return err
	}

	// Get new asset from transient map.
	transientMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("error getting transient: %v", err)
	}

	// Transaction properties are private, therefore they get passed in transient field, instead of func args.
	transientTransactionJSON, ok := transientMap["transaction_properties"]
	if !ok {
		return fmt.Errorf("asset not found in the transient map input")
	}

	type transactionTransientInput struct {
		TransactionID string `json:"transaction_id"`
	}

	var txInput transactionTransientInput
	err = json.Unmarshal(transientTransactionJSON, &txInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	certificateTx, err := s.GetCertificateTransactionByID(ctx, txInput.TransactionID)
	if err != nil {
		return fmt.Errorf("certificate transaction %s is not exist", txInput.TransactionID)
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

	if err := ctx.GetStub().PutPrivateData(constants.CollectionTransaction, certificateTx.ID, certificateTxAsBytes); err != nil {
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
	transactionIterator, err := ctx.GetStub().GetPrivateDataQueryResult(constants.CollectionTransaction, queryString)
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
		transaction.SecretKey = ""
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
	transactionIterator, err := ctx.GetStub().GetPrivateDataQueryResult(constants.CollectionTransaction, queryString)
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
		transaction.SecretKey = ""
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
	transactionIterator, err := ctx.GetStub().GetPrivateDataQueryResult(constants.CollectionTransaction, queryString)
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
		transaction.SecretKey = ""
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
