package services

import (
	"errors"
	"orion/internal/models"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetUserInfo(ctx contractapi.TransactionContextInterface) (*models.User, error) {
	user := &models.User{}

	stub := ctx.GetStub()

	id, err := cid.GetID(stub)
	if err != nil {
		return nil, errors.New("error when retrieve id information")
	}
	user.ID = id

	mspID, err := cid.GetMSPID(stub)
	if err != nil {
		return nil, errors.New("error when retrieve msp id information")
	}
	user.MspID = mspID

	val, ok, _ := cid.GetAttributeValue(stub, "role")
	if ok {
		user.Role = val
	}

	return user, nil
}
