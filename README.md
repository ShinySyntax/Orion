# Orion

This project is a vehicle certificate ownership tracking and transfer system using private blockchain technology. It utilizes Hyperledger Fabric as the blockchain platform, with Go for smart contract implementation and Node JS for backend service development. The frontend is built using Next JS.

## Requirements

- Docker
- Node JS
- Go
- Hyperledger Fabric
- Yarn

## Technologies

- Hyperledger Fabric
- Hyperledger Explorer
- Docker
- Go
- Node JS
- Next JS
- Typescript

## Blockchain Specification

- Consist of 3 organizations.
- Every organizations consist of 2 peer, 2 world state database, and 1 CA (Certificate Authorities).
- Consist of 3 orderer peer, ordering service use raft consensus.
- Consist of 1 channel, 1 chaincode, and 2 private data.

## How to Run Blockchain Network

```sh
sudo ./all.sh
```

## How to Run Backend Services

```sh
cd orion-be
yarn install
sudo ./run-init.sh
yarn dev
```

## How to Run Frontend Services

```sh
cd orion-fe
yarn install
yarn dev
```
