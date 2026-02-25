import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying P2PSPB contracts to Sepolia...\n");

  // Получаем деплойера
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Баланс деплойера
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.log("❌ ERROR: No ETH in account!");
    console.log("Get Sepolia ETH from: https://sepoliafaucet.com\n");
    return;
  }

  // 1. Деплой токена PSPB
  console.log("📦 Deploying PSPBToken...");
  const PSPBToken = await ethers.getContractFactory("PSPBToken");
  const token = await PSPBToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ PSPBToken deployed to:", tokenAddress);

  // 2. Деплой FeeSplitter
  console.log("\n📦 Deploying P2PSPBFeeSplitter...");
  const FeeSplitter = await ethers.getContractFactory("P2PSPBFeeSplitter");
  const feeSplitter = await FeeSplitter.deploy(tokenAddress, deployer.address, deployer.address);
  await feeSplitter.waitForDeployment();
  const feeSplitterAddress = await feeSplitter.getAddress();
  console.log("✅ P2PSPBFeeSplitter deployed to:", feeSplitterAddress);

  // 3. Деплой Escrow
  console.log("\n📦 Deploying P2PSPBEscrow...");
  const Escrow = await ethers.getContractFactory("P2PSPBEscrow");
  const escrow = await Escrow.deploy(tokenAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ P2PSPBEscrow deployed to:", escrowAddress);

  // 4. Настройка связей между контрактами
  console.log("\n🔧 Configuring contracts...");
  
  // Переводим токены в FeeSplitter для airdrop
  console.log("Transferring tokens to FeeSplitter for airdrop...");
  const transferTx = await token.transfer(feeSplitterAddress, ethers.parseEther("1000000")); // 1M токенов
  await transferTx.wait();
  console.log("✅ Tokens transferred");

  console.log("\n" + "=".repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network: Sepolia Testnet");
  console.log("\nContract Addresses:");
  console.log("  PSPBToken:         ", tokenAddress);
  console.log("  P2PSPBFeeSplitter: ", feeSplitterAddress);
  console.log("  P2PSPBEscrow:      ", escrowAddress);
  console.log("\nConfiguration:");
  console.log("  Token Supply:      100,000,000 PSPB");
  console.log("  Airdrop per user:  1,000 PSPB");
  console.log("  Platform Fee:      0.5%");
  console.log("  Fee Distribution:");
  console.log("    - Validators:    60%");
  console.log("    - Treasury:      20%");
  console.log("    - Development:   20%");
  console.log("=".repeat(60));

  console.log("\n🎉 Deployment successful!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${tokenAddress}`);
  console.log("\n2. Add addresses to .env files:");
  console.log("   - contracts/.env");
  console.log("   - services/api/.env");
  console.log("   - apps/web/.env.local");
  console.log("\n3. View on Sepolia Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
