displayConnectionProfileOrg1(){
  echo "peer 0"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  echo "peer 1"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
  echo "ca"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem
}

displayConnectionProfileOrg2(){
  echo "peer 0"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  echo "peer 1"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt
  echo "ca"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem
}

displayConnectionProfileOrg3(){
  echo "peer 0"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
  echo "peer 1"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer1.org3.example.com/tls/ca.crt
  echo "ca"
  cat ./artifacts/channel/crypto-config/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem
}

# displayConnectionProfileOrg1
# displayConnectionProfileOrg2
# displayConnectionProfileOrg3