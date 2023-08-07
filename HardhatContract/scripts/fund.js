const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const KavanoOrders = await ethers.getContract("KavanoOrders", deployer)
  console.log(`Got contract KavanoOrders at ${KavanoOrders.address}`)
  console.log("Funding contract...")

  const orderCreateResponse = await KavanoOrders.createOrder('MDH01', '50')

  const orderCreateResponse2 = await KavanoOrders.createOrder('MDH02', '60')

  // console.log(orderCreateResponse, orderCreateResponse2);
  // const transactionResponse = await KavanoOrders.fund({
  //   value: ethers.utils.parseEther("0.1"),
  // })
  // await transactionResponse.wait()
  // console.log("Funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
