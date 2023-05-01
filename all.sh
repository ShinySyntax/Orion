chmod -R 777 *
sleep 1
./networkDown.sh
sleep 1
./networkUp.sh
sleep 2
./createChannel.sh
sleep 1
./initChaincode.sh