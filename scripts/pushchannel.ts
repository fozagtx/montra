import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function getSigner() {
  const [signer] = await ethers.getSigners();
  return signer;
}

async function main() {
  console.log("Creating channel...");
  const signer = await getSigner();
  console.log("Using signer:", signer.address);

  const response = await PushAPI.channels.create({
    signer: signer,
    chainId: 42101, // Push Chain Donut Testnet ChainId
    name: "Omnipay Channel",
    description: "This channel sends notifications for Omnipay.",
    url: "https://omnipay.vercel.app",
    icon: "https://omnipay.vercel.app/favicon.ico",
    // optional: add more params like "meta" for category, tags, etc.
  });

  console.log("Channel created ✅");
  console.log("Channel Address:", response.channel);
  
  console.log("\nAdd this to your .env file:");
  console.log(`PUSH_CHANNEL=${response.channel}`);
}

main().catch(console.error);
