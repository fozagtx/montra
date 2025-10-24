import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR: true, // Temporarily disabled due to test issues
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    push_donut: {
      url: process.env.VITE_PUSHCHAIN_RPC_URL || "https://evm.rpc-testnet-donut-node1.push.org",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== "your_private_key_here" ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.VITE_PUSHCHAIN_CHAIN_ID || "42101"),
      gas: parseInt(process.env.GAS_LIMIT || "8000000"),
      gasPrice: parseInt(process.env.GAS_PRICE || "20000000000"),
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    showTimeSpent: true,
    showMethodSig: true,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  etherscan: {
    apiKey: {
      push_donut: process.env.ETHERSCAN_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "push_donut",
        chainId: parseInt(process.env.VITE_PUSHCHAIN_CHAIN_ID || "42101"),
        urls: {
          apiURL: process.env.VITE_PUSHCHAIN_EXPLORER_URL || "https://testnet-explorer.push.org/api",
          browserURL: process.env.VITE_PUSHCHAIN_EXPLORER_URL || "https://testnet-explorer.push.org",
        },
      },
    ],
  },
  mocha: {
    timeout: 60000,
    reporter: "spec",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;