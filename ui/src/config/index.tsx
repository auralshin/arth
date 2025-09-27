import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia, base, arbitrum, optimism } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { ChainId } from "../contracts";

export const projectId = import.meta.env.VITE_WALLET_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const localhost = {
  id: ChainId.LOCALHOST,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] }
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8545' }
  }
} as AppKitNetwork;

export const networks = [mainnet, sepolia, base, arbitrum, optimism, localhost] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];
export const wagmiAdapter = new WagmiAdapter({ projectId, networks });

const metadata = {
  name: "IRS on Uniswap v4",
  description: "Fixed vs floating · prototype",
  url: window.location.origin,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: metadata,
  defaultAccountTypes: { eip155: "eoa" },
  coinbasePreference: 'eoaOnly',
  features: { analytics: false },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
