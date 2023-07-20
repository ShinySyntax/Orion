export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=mychannel
export CC_NAME="orion"

setGlobalsForOrderer(){
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp
    
}

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

chaincodeInvoke(){
    setGlobalsForPeer0Org3

    # export TRANSACTION=$(echo -n "{\"certificate_id\":\"8AW204022K0011340\",\"origin_nik\":\"3204091010901234\",\"destination_nik\":\"7204091010901234\",\"secret_key\":\"anjay\"}" | base64 | tr -d \\n)
    # peer chaincode invoke -o localhost:7050 \
    #     --ordererTLSHostnameOverride orderer.example.com \
    #     --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
    #     -C $CHANNEL_NAME -n ${CC_NAME} \
    #     --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
    #     --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
    #     -c '{"function": "CreateCertificateTransaction","Args":[]}' \
    #     --transient "{\"transaction_properties\":\"$TRANSACTION\"}"

    # export TRANSACTION=$(echo -n "{\"transaction_id\":\"a3892a7a0332d74617030067e05224095f0a368d01966636820d265173d84b69\",\"nik\":\"7204091010901234\",\"secret_key\":\"anjay\"}" | base64 | tr -d \\n)
    # peer chaincode invoke -o localhost:7050 \
    #     --ordererTLSHostnameOverride orderer.example.com \
    #     --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
    #     -C $CHANNEL_NAME -n ${CC_NAME} \
    #     --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
    #     -c '{"function": "ApproveCertificateTransaction","Args":[]}' \
    #     --transient "{\"transaction_properties\":\"$TRANSACTION\"}"

    # export TRANSACTION=$(echo -n "{\"transaction_id\":\"a3892a7a0332d74617030067e05224095f0a368d01966636820d265173d84b69\"}" | base64 | tr -d \\n)
    # peer chaincode invoke -o localhost:7050 \
    #     --ordererTLSHostnameOverride orderer.example.com \
    #     --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
    #     -C $CHANNEL_NAME -n ${CC_NAME} \
    #     --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
    #     --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
    #     -c '{"function": "ProcessCertificateTransaction","Args":[]}' \
    #     --transient "{\"transaction_properties\":\"$TRANSACTION\"}"  

    peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
    -C $CHANNEL_NAME -n ${CC_NAME} \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
    --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
    -c '{"function": "AddMaintenanceHistory","Args":["MHF3LCC16LK987654", "jira", "b", "c", "d"]}'

    # peer chaincode invoke -o localhost:7050 \
    # --ordererTLSHostnameOverride orderer.example.com \
    # --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
    # -C $CHANNEL_NAME -n ${CC_NAME} \
    # --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
    # --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
    # --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
    # -c '{"function": "AddAccidentHistory","Args":["MHF3LCC16LK987654", "V_CONDITION", "V_DESCRIPTION", "LOCATION", "OCC_TIME", "REPORT"]}'
}

chaincodeQuery(){
    setGlobalsForPeer0Org3
    # peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetAllListTransactions"]}'
    # peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetCertificatesByNIK", "5403014210135678"]}'
    # peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetListCertificateHistory", "8AW204022K0011340"]}'
    # peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetCertificateByID", "8AW204022K0011340"]}'
    # peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetCertificateTransactionByID", "a3892a7a0332d74617030067e05224095f0a368d01966636820d265173d84b68"]}'
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["GetListMaintenanceHistoryByID", "MHF3LCC16LK987654"]}'
}

# chaincodeInvoke
chaincodeQuery