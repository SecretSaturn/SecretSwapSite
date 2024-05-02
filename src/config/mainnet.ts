export const config = {
  NETWORK_TYPE: 'MAINNET',

  CHAIN_ID: 'secret-4',
  CHAIN_NAME: 'Secret 4',

  SECRET_RPC: 'https://rpc.mainnet.secretsaturn.net/',
  // SECRET_WS: 'wss://bootstrap.secrettestnet.io:26667/websocket',
  SECRET_LCD: 'https://lcd.mainnet.secretsaturn.net/',

  BACKEND_URL: 'https://api-bridge-mainnet.azurewebsites.net',
  // PLSM_BACKEND_URL: 'https://bridge-plasm-backend-testnet.azurewebsites.net',
  BSC_BACKEND_URL: 'https://bridge-bsc-mainnet.azurewebsites.net',

  SCRT_SWAP_CONTRACT: 'secret1sferux27lpr3lm52c8sq2dd7m54xhm28thnj5y',
  BSC_SCRT_SWAP_CONTRACT: 'secret168mwctng6s7vk9w5d7n0wsty2f7vaq3rjq8g7c',
  // PLSM_SWAP_CONTRACT: 'secret15qjcgvf7djvvlnfmls90vmetflgr20vn5p00as',

  ETH_MANAGER_CONTRACT: '0xf4B00C937b4ec4Bb5AC051c3c719036c668a31EC',
  BSC_MANAGER_CONTRACT: '0x3E171dD33502fb993A853F420eA3cd8E9385B757',
  // PLSM_MANAGER_CONTRACT: '0xa0483CA2E6768Fa2aA4c65150225DF4560459558',

  ETH_EXPLORER_URL: 'https://etherscan.io',
  BSC_EXPLORER_URL: 'https://bscscan.com/',
  SCRT_EXPLORER_URL: 'https://secretnodes.com/secret/chains/secret-4',

  SSCRT_CONTRACT: 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek',
  MASTER_CONTRACT: 'secret1cm5k5k2kzwgnyccqnz4ml8uqaa25egzzvsmn2f',
  MINTER_CONTRACT: 'secret1tgagwaea268dkz7255mcau28z8qs08lnllgecm',
  FACTORY_CONTRACT: 'secret1yzmqf06vcrzdz3str4xa3ncf7ndxq732s4vvjl',

  AMM_FACTORY_CONTRACT: 'secret1fjqlk09wp7yflxx7y433mkeskqdtw3yqerkcgp',
  AMM_ROUTER_CONTRACT: 'secret1xy5r5j4zp0v5fzza5r9yhmv7nux06rfp2yfuuv',
  SIG_THRESHOLD: 3,

  FETCHER_CONFIGS: {}, // comes from the services/index.ts => getFetcherConfigs function
  PRICE_DATA: {},      // comes from the services/index.ts => getPriceData function
};
