// Simple script to create a Push Channel using ethers directly
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Creating Push Channel...");
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Push Channel Factory address on Push Donut Testnet
  const channelFactoryAddress = "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa";
  
  // Simple ABI for channel creation
  const channelFactoryABI = [
    "function createChannel(string name, string description, string url, string icon) external returns (address)"
  ];

  const channelFactory = new ethers.Contract(
    channelFactoryAddress,
    channelFactoryABI,
    signer
  );

  console.log("Creating channel on Push Donut Testnet...");
  const tx = await channelFactory.createChannel(
    "OmniPay Channel",
    "Cross-chain payment notifications for OmniPay",
    "https://omnipay.vercel.app",
    "https://omnipay.vercel.app/favicon.ico"
  );

  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("Channel created successfully!");
  
  // Log the entire transaction receipt for debugging
  console.log("Transaction receipt:", JSON.stringify(receipt, null, 2));
  
  // Use the transaction hash to look up the channel on the explorer
  console.log("Channel created! Please check the transaction on the explorer:");
  console.log(`https://testnet-explorer.push.org/tx/${tx.hash}`);
  
  // The channel address is likely the transaction sender
  const channelAddress = signer.address;
  console.log("Channel Owner Address:", channelAddress);
  
  console.log("\nAdd this to your .env file:");
  console.log(`PUSH_CHANNEL=${channelAddress}`);
  console.log(`NEXT_PUBLIC_PUSH_CHANNEL=${channelAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });