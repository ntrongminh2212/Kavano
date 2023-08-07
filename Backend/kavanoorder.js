import { ethers } from 'ethers';
import { contractAddress, abi } from './constants.js'
import { } from 'dotenv/config'
import { mysqlDateFormat } from './controllers/order.js';
import { db } from './index.js';

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);
const signer = provider.getSigner();

export const KavanoOrders = new ethers.Contract(contractAddress, abi, signer);
export const listenToEvent = () => {
    console.log('hello');
    KavanoOrders.on('CreateOrderEvent', (_order_id) => {
        console.log('Contract event: New order create', _order_id);
    })

    KavanoOrders.on('FundEvent', (_order_id, totalCostETH) => {
        console.log('Contract event: Fund ', _order_id);
        const updateStatus = "UPDATE `order` SET `status`= 'Placed' "
            + `,place_time = '${mysqlDateFormat()}', eth_pay= ${ethers.utils.formatEther(totalCostETH)}`
            + ` WHERE order_id = '${_order_id}'`

        db.query(updateStatus, (err, rs) => {
            if (!err) {
                console.log('Placed order !!');
            } else {
                console.log(err);
            }
        });
    })

    KavanoOrders.on('WithdrawEvent', (address) => {
        console.log('Contract event: Withdraw from ', address);
    })

    KavanoOrders.on('RepayEvent', (address) => {
        console.log('Contract event: Repay for ', address);
    })
}