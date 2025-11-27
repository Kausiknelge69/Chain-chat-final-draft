const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("==========================================");
  console.log("🕵️  DEPLOYER DEBUGGER");
  console.log("==========================================");
  console.log("🔑 Hardhat is using this address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance on Amoy Network:", hre.ethers.formatEther(balance), "POL");
  console.log("==========================================");

  if (balance === 0n) {
    console.error("❌ ERROR: This account has 0 funds. Deployment will fail.");
    console.error("👉 Please check if 'deployer.address' matches your MetaMask address.");
    return;
  }

  console.log("🚀 Balance looks good! Deploying now...");
  
  const ChainChain = await hre.ethers.getContractFactory("ChainChain");
  const chainChain = await ChainChain.deploy();
  await chainChain.waitForDeployment();

  console.log("✅ ChainChain deployed to:", chainChain.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});