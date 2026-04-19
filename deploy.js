import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const Contract = await hre.ethers.getContractFactory("Zainab_SupplyChain");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(" Zainab_SupplyChain deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});