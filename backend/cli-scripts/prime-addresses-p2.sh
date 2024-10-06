TX_ID="$1"
NOTARIZING_ADDRESS_COUNT="$2"

#calculate total fee
fee_rate_json=$( ./litecoin-cli.sh estimaterawfee conf_target=5 threshold=0.95 )
fee_rate=$(jq -rn --argjson json "$fee_rate_json" '[$json.short.feerate,$json.medium.feerate,$json.long.feerate] | del(.. | nulls) | .[0]' )
fee_rate=$(printf '%.8f\n' "$fee_rate")
#overhead + 1 input + 1 output
total_tx_size='194'
total_fee=$(echo "$total_tx_size * $fee_rate" | bc | awk '{printf "%.8f", $0}')

tx_info=$(./litecoin-cli.sh gettransaction txid=$TX_ID)
for i in $(seq 0 $(( $NOTARIZING_ADDRESS_COUNT - 1))); do
    output_details=$(jq -rn --argjson tx "$tx_info" --argjson vout "$i" '$tx.details[] | select(.vout==$vout and .category=="receive") ')

    recieving_amount=$(jq -rn --argjson details "$output_details" '$details.amount')
    recieving_address=$(jq -rn --argjson details "$output_details" '$details.address')
    change_total=$( echo "$recieving_amount - $total_fee" | bc | awk '{printf "%.8f", $0}' )

    INPUT=$(jq -crn --arg txid "$TX_ID" --argjson vout "$i" '[{ "txid": $txid , "vout": $vout}]')
    OUTPUT=$(jq -crn --arg change_address "$recieving_address" --argjson change_total "$change_total" '{($change_address): $change_total}' )
    raw_tx_hex=$(./litecoin-cli.sh createrawtransaction inputs="$INPUT" outputs="$OUTPUT" )
    signed_tx_hex=$(./litecoin-cli.sh signrawtransactionwithwallet hexstring="$raw_tx_hex" | jq -r '.hex' )
    sent_tx_hash=$(./litecoin-cli.sh sendrawtransaction hexstring="$signed_tx_hex" )
    echo "tx hash: $sent_tx_hash"

    #INPUTS=$(jq -crn --arg txid "$SOURCE_TXID" --argjson vout "$SOURCE_VOUT" '[{ "txid": $txid , "vout": $vout}]')
done
