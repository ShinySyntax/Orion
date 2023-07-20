export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=mychannel
export CC_NAME="orion"

setGlobalsForPeer0Org1(){
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
  export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Org2(){
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
  export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051
}

setGlobalsForPeer0Org3(){
  export CORE_PEER_LOCALMSPID="Org3MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
  export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
  export CORE_PEER_ADDRESS=localhost:11051
}

integrityTest1() {
  setGlobalsForPeer0Org3

  peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
  -c '{"function": "AddMaintenanceHistory","Args":["MHF3LCC16LK987654", "par1", "par2", "par3", "par4"]}'
  
  sleep 2

  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetListMaintenanceHistoryByID", "MHF3LCC16LK987654"]}'
}
integrityTest1

# Delete or change data from world state db directly, after that run this command
integrityTest2() {
  setGlobalsForPeer0Org3
  peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
  --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
  -c '{"function": "AddMaintenanceHistory","Args":["MHF3LCC16LK987654", "par1", "par2", "par3", "par4"]}'
  echo "************************************************************"
}
# integrityTest2

privateDataTest() {
  setGlobalsForPeer0Org3

  # Query private data.
  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetAllListTransactions"]}'

  # Invoke new transaction private data.
  export TRANSACTION=$(echo -n "{\"certificate_id\":\"8AW204022K0011340\",\"origin_nik\":\"3204091010901234\",\"destination_nik\":\"7204091010901234\",\"secret_key\":\"anjay\", \"transaction_detail\":\"transaction_detail\"}" | base64 | tr -d \\n)
  peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
  --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
  -c '{"function": "CreateCertificateTransaction","Args":[]}' \
  --transient "{\"transaction_properties\":\"$TRANSACTION\"}"
}
# privateDataTest
