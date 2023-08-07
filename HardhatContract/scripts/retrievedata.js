const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    console.log(deployer);
    const KavanoOrders = await ethers.getContract("KavanoOrders", deployer)
    console.log(`Got contract KavanoOrders at ${KavanoOrders.address}`)
    console.log("Funding contract...")

    // const orderCreateResponse = await KavanoOrders.retrieveTotalCost('MHDaa850633-751f-11ed-aeaa-5')
    // const order = await KavanoOrders.orderById('MHDac03e45d-754b-11ed-aeaa-5')
    // console.log(order);

    const allOrders = await KavanoOrders.viewAllOrder();
    console.log(allOrders);

    const balance = await KavanoOrders.viewBalance();
    console.log(balance);
    // const transactionResponse = await KavanoOrders.fund()
    // await transactionResponse.wait()
    // console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
