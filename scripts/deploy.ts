import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${(await deployer.provider!.getNetwork()).name}`);

  const PUSH_COMM = process.env.PUSH_COMM || ethers.ZeroAddress;
  const PUSH_CHANNEL = process.env.PUSH_CHANNEL || ethers.ZeroAddress;

  // Deploy Notifier
  const Notifier = await ethers.getContractFactory("OmniPayNotifier");
  const notifier = await Notifier.deploy(deployer.address, PUSH_COMM, PUSH_CHANNEL);
  await notifier.waitForDeployment();
  console.log(`OmniPayNotifier: ${await notifier.getAddress()}`);

  // Deploy Core
  const Core = await ethers.getContractFactory("OmniPayCore");
  const core = await Core.deploy(deployer.address, await notifier.getAddress());
  await core.waitForDeployment();
  console.log(`OmniPayCore: ${await core.getAddress()}`);

  // Deploy Subscription
  const Sub = await ethers.getContractFactory("OmniPaySubscription");
  const subscription = await Sub.deploy(await notifier.getAddress());
  await subscription.waitForDeployment();
  console.log(`OmniPaySubscription: ${await subscription.getAddress()}`);

  // Deploy Settlement
  const Settlement = await ethers.getContractFactory("OmniPaySettlement");
  const settlement = await Settlement.deploy(deployer.address, await notifier.getAddress());
  await settlement.waitForDeployment();
  console.log(`OmniPaySettlement: ${await settlement.getAddress()}`);

  // Deploy Bridge (real implementation, not stub)
  const Bridge = await ethers.getContractFactory("OmniPayBridge");
  const bridge = await Bridge.deploy(
    await notifier.getAddress(),
    PUSH_COMM,
    PUSH_CHANNEL
  );
  await bridge.waitForDeployment();
  console.log(`OmniPayBridge: ${await bridge.getAddress()}`);

  // Deploy Bridge Stub (for testing/fallback)
  const BridgeStub = await ethers.getContractFactory("OmniPayBridgeStub");
  const bridgeStub = await BridgeStub.deploy(deployer.address);
  await bridgeStub.waitForDeployment();
  console.log(`OmniPayBridgeStub: ${await bridgeStub.getAddress()}`);

  // Create deployment info for frontend
  const deploymentInfo = {
    network: (await deployer.provider!.getNetwork()).name,
    chainId: (await deployer.provider!.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      OmniPayNotifier: await notifier.getAddress(),
      OmniPayCore: await core.getAddress(),
      OmniPaySubscription: await subscription.getAddress(),
      OmniPaySettlement: await settlement.getAddress(),
      OmniPayBridge: await bridge.getAddress(),
      OmniPayBridgeStub: await bridgeStub.getAddress()
    },
    deployedAt: new Date().toISOString()
  };

  // Save deployment info to frontend
  const frontendPath = join(__dirname, "../frontend/src/config/contracts.json");
  writeFileSync(frontendPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${frontendPath}`);
  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});