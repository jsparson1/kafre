set -e
HEX="$1"
TX_SIZE='295'

notarizing_tx="$(head -n1 notarizing)"

#calculate total fee
fee_rate_json=$( ./litecoin-cli.sh estimaterawfee conf_target=1 threshold=0.99 )
fee_rate=$(jq -rn --argjson json "$fee_rate_json" '[$json.short.feerate,$json.medium.feerate,$json.long.feerate] | del(.. | nulls) | .[0]' )
fee_rate=$(printf '%.8f\n' "$fee_rate")
total_fee=$(echo "$TX_SIZE * $fee_rate" | bc | awk '{printf "%.8f", $0}')


tx_info=$(./litecoin-cli.sh gettransaction txid=$notarizing_tx)

amount=$(jq -rn --argjson tx "$tx_info" '$tx.details[] | select(.vout==0 and .category=="receive") | .amount')
change_address=$(jq -rn --argjson tx "$tx_info" '$tx.details[] | select(.vout==0 and .category=="receive") | .address')

change_total=$( echo "$amount - $total_fee" | bc | awk '{printf "%.8f", $0}' )

INPUT=$(jq -crn --arg txid "$notarizing_tx" '[{ "txid": $txid , "vout": 0}]')
OUTPUT=$(jq -crn --arg change_address "$change_address" --argjson change_total "$change_total" --arg hex "$HEX" '{($change_address): $change_total, "data": $hex}' )

raw_tx_hex=$(./litecoin-cli.sh createrawtransaction inputs="$INPUT" outputs="$OUTPUT" )
signed_tx_hex=$(./litecoin-cli.sh signrawtransactionwithwallet hexstring="$raw_tx_hex" | jq -r '.hex' )
sent_tx_hash=$(./litecoin-cli.sh sendrawtransaction hexstring="$signed_tx_hex" )
echo "$sent_tx_hash" >> notarizing
sed -i '1d' notarizing
echo "tx hash: $sent_tx_hash"
echo "$HEX $sent_tx_hash" >> docs