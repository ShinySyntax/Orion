chmod -R 777 *
sleep 2
./networkDown.sh
sleep 2
./networkUp.sh
sleep 2
./createChannel.sh
sleep 2
./initChaincode.sh