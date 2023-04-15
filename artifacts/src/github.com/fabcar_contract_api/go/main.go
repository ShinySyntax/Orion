package main

import (
	"fmt"
	"orion/internal/services"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	chaincode, err := contractapi.NewChaincode(new(services.SmartContract))
	if err != nil {
		fmt.Printf("Error create chaincode 1: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode 1: %s", err.Error())
	}
}
