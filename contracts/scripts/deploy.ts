import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying P2PSPB contracts...");

  // Получаем деплойера
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Баланс деплойера
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // 1. Деплой токена PSPB
  console.log("\n📦 Deploying PSPBToken...");
  const PSPBToken = await ethers.getContractFactory("PSPBToken");
  const token = await PSPBToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ PSPBToken deployed to:", tokenAddress);

  // 2. Деплой FeeSplitter
  console.log("\n📦 Deploying P2PSPBFeeSplitter...");
  const treasury = deployer.address; // Временно на деплойера
  const devFund = deployer.address;  // Временно на деплойера
  
  const FeeSplitter = await ethers.getContractFactory("P2PSPBFeeSplitter");
  const feeSplitter = await FeeSplitter.deploy(tokenAddress, treasury, devFund);
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

  // Установить FeeSplitter в токене
  console.log("Setting FeeSplitter in token...");
  const tx1 = await token.setFeeSplitter(feeSplitterAddress);
  await tx1.wait();

  // Установить FeeSplitter в escrow
  console.log("Setting FeeSplitter in escrow...");
  const tx2 = await escrow.setFeeSplitter(feeSplitterAddress);
  await tx2.wait();

  // Установить owner токена в feeSplitter (для mint)
  console.log("Setting token owner in feeSplitter...");
  const tx3 = await token.setFeeSplitter(feeSplitterAddress);
  await tx3.wait();

  console.log("\n✅ Configuration complete!");

  // Вывод информации
  console.log("\n" + "=".repeat(50));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Network:", ethers.provider._network?.name || "unknown");
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
  console.log("=".repeat(50));

  console.log("\n🎉 Deployment successful!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Etherscan");
  console.log("2. Add liquidity");
  console.log("3. Enable airdrop");
  console.log("4. Deploy frontend integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
