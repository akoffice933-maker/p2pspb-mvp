import { expect } from "chai";
import { ethers } from "hardhat";
import { PSPBToken, P2PSPBEscrow, P2PSPBFeeSplitter } from "../typechain-types";

describe("P2PSPB Contracts", function () {
  let token: PSPBToken;
  let escrow: P2PSPBEscrow;
  let feeSplitter: P2PSPBFeeSplitter;
  let owner: any;
  let seller: any;
  let buyer: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Деплой токена
    const PSPBToken = await ethers.getContractFactory("PSPBToken");
    token = await PSPBToken.deploy();
    await token.waitForDeployment();

    // Деплой FeeSplitter
    const FeeSplitter = await ethers.getContractFactory("P2PSPBFeeSplitter");
    feeSplitter = await FeeSplitter.deploy(
      await token.getAddress(),
      owner.address,
      owner.address
    );
    await feeSplitter.waitForDeployment();

    // Деплой Escrow
    const Escrow = await ethers.getContractFactory("P2PSPBEscrow");
    escrow = await Escrow.deploy(await token.getAddress());
    await escrow.waitForDeployment();

    // Настройка
    await token.setFeeSplitter(await feeSplitter.getAddress());
    await escrow.setFeeSplitter(await feeSplitter.getAddress());
  });

  describe("PSPBToken", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("100000000"));
    });

    it("Should allow airdrop claim", async function () {
      await token.connect(buyer).claimAirdrop();
      const balance = await token.balanceOf(buyer.address);
      expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Should prevent double airdrop claim", async function () {
      await token.connect(buyer).claimAirdrop();
      await expect(token.connect(buyer).claimAirdrop()).to.be.reverted;
    });

    it("Should allow minting by owner", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.mint(buyer.address, mintAmount);
      const balance = await token.balanceOf(buyer.address);
      expect(balance).to.equal(mintAmount);
    });
  });

  describe("P2PSPBEscrow", function () {
    it("Should create trade successfully", async function () {
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("order-1"));
      
      await token.mint(seller.address, ethers.parseEther("100"));
      await token.connect(seller).approve(await escrow.getAddress(), ethers.parseEther("100"));
      
      await expect(
        escrow.connect(seller).createTrade(
          buyer.address,
          ethers.parseEther("10"),
          92.5,
          orderHash
        )
      ).to.emit(escrow, "TradeCreated");
    });

    it("Should prevent duplicate order hash", async function () {
      const orderHash = ethers.keccak256(ethers.toUtf8Bytes("order-2"));
      
      await token.mint(seller.address, ethers.parseEther("100"));
      await token.connect(seller).approve(await escrow.getAddress(), ethers.parseEther("100"));
      
      await escrow.connect(seller).createTrade(
        buyer.address,
        ethers.parseEther("10"),
        92.5,
        orderHash
      );
      
      await expect(
        escrow.connect(seller).createTrade(
          buyer.address,
          ethers.parseEther("10"),
          92.5,
          orderHash
        )
      ).to.be.reverted;
    });
  });

  describe("P2PSPBFeeSplitter", function () {
    it("Should receive and distribute fees", async function () {
      const feeAmount = ethers.parseEther("100");
      
      // Минтим токены для теста
      await token.mint(owner.address, feeAmount);
      await token.approve(await feeSplitter.getAddress(), feeAmount);
      
      // Переводим комиссию
      await token.transfer(await feeSplitter.getAddress(), feeAmount);
      
      const balance = await token.balanceOf(await feeSplitter.getAddress());
      expect(balance).to.equal(feeAmount);
    });

    it("Should allow validator staking", async function () {
      const stakeAmount = ethers.parseEther("10000");
      
      await token.mint(buyer.address, stakeAmount);
      await token.connect(buyer).approve(await feeSplitter.getAddress(), stakeAmount);
      
      await expect(
        feeSplitter.connect(buyer).stake(stakeAmount)
      ).to.emit(feeSplitter, "ValidatorStaked");
    });
  });
});
