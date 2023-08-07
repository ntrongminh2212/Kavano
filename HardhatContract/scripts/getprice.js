const { BigNumber } = require("ethers");
const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const KavanoOrders = await ethers.getContract("KavanoOrders", deployer)
    console.log(`Got contract KavanoOrders at ${KavanoOrders.address}`)

    const TotalEth = await KavanoOrders.USDtoWEI(50);
    const EthPrice = await KavanoOrders.getPriceETH();

    console.log("TotalEth: ", TotalEth.toString());
    console.log("ETH price:", EthPrice.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
