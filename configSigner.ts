import { PushChain } from "@pushchain/core";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

async function main() {
  const account = privateKeyToAccount(generatePrivateKey());
  const walletClient = createWalletClient({
    account,
    transport: http("https://evm.rpc-testnet-donut-node1.push.org"),
  });
  const universalSigner = await PushChain.utils.signer.toUniversal(walletClient);
  console.log("🔑 Got universal signer - Viem");
  console.log(JSON.stringify(universalSigner));
}

await main().catch(console.error);
