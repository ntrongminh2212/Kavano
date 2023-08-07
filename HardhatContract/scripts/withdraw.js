const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const KavanoOrders = await ethers.getContract("KavanoOrders", deployer)
  console.log(`Got contract KavanoOrders at ${KavanoOrders.address}`)
  console.log("Withdrawing from contract...")
  const transactionResponse = await KavanoOrders.withdraw()
  await transactionResponse.wait()
  console.log("Got it back!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
