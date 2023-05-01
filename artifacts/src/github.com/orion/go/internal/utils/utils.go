package utils

import (
	"errors"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func IsAuthorize(ctx contractapi.TransactionContextInterface, expectedMspID string) error {
	mspID, _ := cid.GetMSPID(ctx.GetStub())
	if mspID != expectedMspID {
		return errors.New("not eligible to process this certificate transaction, only goverment org are allowed")
	}

	return nil
}
