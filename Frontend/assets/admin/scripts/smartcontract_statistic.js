console.log(123);
import { BigNumber, ethers } from "../scripts/lib/ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./lib/constants.js";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const KavanoOrder = new ethers.Contract(contractAddress, abi, signer);
const h1ContractBalance = document.querySelector('#contract-balance');

const balance = ethers.utils.formatEther((await KavanoOrder.viewBalance()));
h1ContractBalance.innerHTML = `${balance} <img src="../img/Ethereum-icon.svg" style="height: 44px;">`

listenToEvent();
function listenToEvent() {
    KavanoOrder.on('FundEvent', async (_order_id, totalCostETH) => {
        console.log('Contract event: Fund ', _order_id);
        const balance = ethers.utils.formatEther((await KavanoOrder.viewBalance()));
        h1ContractBalance.innerHTML = `${balance} <img src="../img/Ethereum-icon.svg" style="height: 44px;">`
    })

    KavanoOrder.on('WithdrawEvent', async (address) => {
        console.log('Contract event: Withdraw from ', address);
        const balance = ethers.utils.formatEther((await KavanoOrder.viewBalance()));
        h1ContractBalance.innerHTML = `${balance} <img src="../img/Ethereum-icon.svg" style="height: 44px;">`

    })

    KavanoOrder.on('RepayEvent', async (address) => {
        console.log('Contract event: Repay for ', address);
        const balance = ethers.utils.formatEther((await KavanoOrder.viewBalance()));
        h1ContractBalance.innerHTML = `${balance} <img src="../img/Ethereum-icon.svg" style="height: 44px;">`

    })
}