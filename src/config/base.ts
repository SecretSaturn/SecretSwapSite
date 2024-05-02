const baseConfig = {
  ETH_GAS_LIMIT: 75000,
  SWAP_FEE: 750000,

  TEST_COINS: false,
  IS_MAINTENANCE: true,

};

// This is a conditional require statement.  So if REACT_APP_NETWORK is 'mainnet' it will load mainnet.js
const networkConfig = "mainnet";

// Merge the baseConfig and the networkConfig into Typescript's global scope
globalThis.config = { ...baseConfig, ...networkConfig };

// Necessary because create-react-app enforces isolatedModules
export {};
