SOURCE_TXID="$1"
SOURCE_VOUT="$2"

SPLIT_SIZE='0.1'
SPLIT_COUNT='3'
 
tx_info=$(./litecoin-cli.sh gettransaction txid=$SOURCE_TXID)

#calculate total fee
fee_rate_json=$( ./litecoin-cli.sh estimaterawfee conf_target=1 threshold=0.99 )
fee_rate=$(jq -rn --argjson json "$fee_rate_json" '[$json.short.feerate,$json.medium.feerate,$json.long.feerate] | del(.. | nulls) | .[0]' )
fee_rate=$(printf '%.8f\n' "$fee_rate")
#overhead + 1 input + total outputs
total_tx_size=$(( (10 + 150 + 34 * $SPLIT_COUNT)))
total_fee=$(echo "$total_tx_size * $fee_rate" | bc | awk '{printf "%.8f", $0}')

recieving_address=$(jq -rn --argjson tx "$tx_info" --argjson vout "$SOURCE_VOUT" '$tx.details[] | select(.vout==$vout) | .address ')
recieving_amount=$(jq -rn --argjson tx "$tx_info" --argjson vout "$SOURCE_VOUT" '$tx.details[] | select(.vout==$vout) | .amount ')
change_total=$( echo "$recieving_amount - $total_fee - $SPLIT_SIZE * $SPLIT_COUNT" | bc | awk '{printf "%.8f", $0}' )

outbound_addresses='[]'
for i in $(seq 1 $SPLIT_COUNT); do
    new_address=$(./litecoin-cli.sh getnewaddress)
    outbound_addresses=$(jq -rn --argjson outputs "$outbound_addresses" --arg new_addie "$new_address" '$outputs + [$new_addie]' )
done


INPUTS=$(jq -crn --arg txid "$SOURCE_TXID" --argjson vout "$SOURCE_VOUT" '[{ "txid": $txid , "vout": $vout}]')
#OUTPUTS=$(jq -rn --arg change_address "$recieving_address" --argjson change_total "$change_total" --argjson amount "$SPLIT_SIZE" --argjson outbound_addresses "$outbound_addresses" '[$outbound_addresses[] | { (.) :  $amount}] + [{ ($change_address): $change_total}]' )
OUTPUTS=$(jq -crn --arg change_address "$recieving_address" --argjson change_total "$change_total" --argjson amount "$SPLIT_SIZE" --argjson outbound_addresses "$outbound_addresses" '([$outbound_addresses[] | { (.) :  $amount}] + [{ ($change_address): $change_total}] | add )' )

echo "INPUTS = $INPUTS"
echo "OUTPUTS = $OUTPUTS"
echo "total fee = $total_fee"

raw_tx_hex=$(./litecoin-cli.sh createrawtransaction inputs="$INPUTS" outputs="$OUTPUTS" )
signed_tx_hex=$(./litecoin-cli.sh signrawtransactionwithwallet hexstring="$raw_tx_hex" | jq -r '.hex' )

sent_tx_hash=$(./litecoin-cli.sh sendrawtransaction hexstring="$signed_tx_hex" )

echo "output transaction: $sent_tx_hash"