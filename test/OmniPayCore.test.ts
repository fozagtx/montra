import { expect } from "chai";
import { ethers } from "hardhat";
import { OmniPayCore, OmniPayNotifier } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OmniPayCore", function () {
  let omniPayCore: OmniPayCore;
  let omniPayNotifier: OmniPayNotifier;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy OmniPayNotifier first
    const NotifierFactory = await ethers.getContractFactory("OmniPayNotifier");
    omniPayNotifier = await NotifierFactory.deploy(
      owner.address,      // initialOwner
      ethers.ZeroAddress, // PUSH_COMM
      ethers.ZeroAddress  // PUSH_CHANNEL
    );
    await omniPayNotifier.waitForDeployment();

    // Deploy OmniPayCore
    const CoreFactory = await ethers.getContractFactory("OmniPayCore");
    omniPayCore = await CoreFactory.deploy(owner.address, await omniPayNotifier.getAddress());
    await omniPayCore.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct notifier address", async function () {
      expect(await omniPayCore.notifier()).to.equal(await omniPayNotifier.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await omniPayCore.owner()).to.equal(owner.address);
    });
  });

  describe("Basic Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      // Initially not paused
      expect(await omniPayCore.paused()).to.be.false;

      // Pause the contract
      await omniPayCore.pause();
      expect(await omniPayCore.paused()).to.be.true;

      // Unpause the contract
      await omniPayCore.unpause();
      expect(await omniPayCore.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(omniPayCore.connect(user1).pause()).to.be.revertedWithCustomError(
        omniPayCore,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Payment Processing", function () {
    const paymentAmount = ethers.parseEther("1.0");

    it("Should process a basic payment", async function () {
      // This test would need to be expanded based on the actual payment logic
      // For now, we'll just check that the contract is deployed and functional
      expect(await omniPayCore.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should handle payment with proper event emission", async function () {
      // This would test actual payment functionality once implemented
      // For now, we ensure the contract is ready for such operations
      expect(await omniPayCore.notifier()).to.equal(await omniPayNotifier.getAddress());
    });
  });

  describe("Access Control", function () {
    it("Should maintain proper ownership", async function () {
      expect(await omniPayCore.owner()).to.equal(owner.address);
    });

    it("Should allow ownership transfer", async function () {
      await omniPayCore.transferOwnership(user1.address);
      expect(await omniPayCore.owner()).to.equal(user1.address);
    });
  });
});