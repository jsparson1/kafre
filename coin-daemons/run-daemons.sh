RPC_PORT="19332"
RPC_USER="kafre-ltc-signet-user"
RPC_PASS="4G6mXl0Le+ViKRmy/jCeek1CrRxktGmipcokvrnHUGaX2waCwPdeno0sU9gANyqAQFVkT6AVJNd7V3C7H9wxwA=="

./litecoind -signet -server -rpcbind="0.0.0.0" -rest -rpcallowip="0.0.0.0/0" -datadir=$HOME/ltc-data/chaindata -rpcport="$RPC_PORT" -rpcpassword="$RPC_PASS" -rpcuser="$RPC_USER" > /dev/null