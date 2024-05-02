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

export const tokenImages = {
  'AAVE': '/static/token-images/aave_ethereum.svg',
  'ADA(BSC)': '/static/token-images/ada_binance.svg',
  'ALPHA': '/static/token-images/alpha_ethereum.svg',
  'ALTER': '/static/tokens/alter.svg',
  'ATOM': '/static/atom.png',
  'BAC': '/static/token-images/bac_ethereum.svg',
  'BAKE(BSC)': '/static/token-images/bake_binance.svg',
  'BAND': '/static/token-images/band_ethereum.svg',
  'BAT': '/static/token-images/bat_ethereum.svg',
  'BCH(BSC)': '/static/token-images/bch_binance.svg',
  'BNB(BSC)': '/static/token-images/bnb_binance.svg',
  'BUNNY(BSC)': '/static/token-images/bunny_binance.svg',
  'BUSD(BSC)': '/static/token-images/busd_binance.svg',
  'CAKE(BSC)': '/static/token-images/cake_binance.svg',
  'COMP': '/static/token-images/comp_ethereum.svg',
  'DAI': '/static/token-images/dai_ethereum.svg',
  'DOGE(BSC)': '/static/token-images/doge_binance.svg',
  'DOT(BSC)': '/static/token-images/dot_binance.svg',
  'DPI': '/static/token-images/dpi_ethereum.svg',
  'DVPN': '/static/dvpn.png',
  'ENJ': '/static/token-images/enj_ethereum.svg',
  'ETH': '/static/token-images/eth_ethereum.svg',
  'ETH(BSC)': '/static/token-images/eth_binance.svg',
  'FINE(BSC)': '/static/token-images/fine_binance.svg',
  'KNC': '/static/token-images/knc_ethereum.svg',
  'LINA(BSC)': '/static/token-images/lina_binance.svg',
  'LINK': '/static/token-images/link_ethereum.svg',
  'LINK(BSC)': '/static/token-images/link_binance.svg',
  'LTC(BSC)': '/static/token-images/ltc_binance.svg',
  'LUNA': '/static/luna.png',
  'MANA': '/static/token-images/mana_ethereum.svg',
  'MKR': '/static/token-images/mkr_ethereum.svg',
  'OCEAN': '/static/token-images/ocean_ethereum.svg',
  'OSMO': '/static/osmo.png',
  'REN': '/static/token-images/ren_ethereum.svg',
  'RENBTC': '/static/token-images/renbtc_ethereum.svg',
  'RSR': '/static/token-images/rsr_ethereum.svg',
  'RUNE': '/static/token-images/rune_ethereum.svg',
  'SEFI': '/static/token-images/sefi.svg',
  'SHD': '/static/tokens/shade.svg',
  'SIENNA': '/static/token-images/sienna.svg',
  'SNX': '/static/token-images/snx_ethereum.svg',
  'SSCRT': '/static/token-images/sscrt.svg',
  'SUSHI': '/static/token-images/sushi_ethereum.svg',
  'TORN': '/static/token-images/torn_ethereum.svg',
  'TRX(BSC)': '/static/token-images/trx_binance.svg',
  'TUSD': '/static/token-images/tusd_ethereum.svg',
  'UNI': '/static/token-images/uni_ethereum.svg',
  'UNILP-WSCRT-ETH': '/static/token-images/unilp_ethereum.svg',
  'USDC': '/static/token-images/usdc_ethereum.svg',
  'USDC(BSC)': '/static/token-images/usdc_binance.svg',
  'USDT': '/static/token-images/usdt_ethereum.svg',
  'USDT(BSC)': '/static/token-images/usdt_binance.svg',
  'WBTC': '/static/token-images/wbtc_ethereum.svg',
  'XMR': '/static/sXMR.png',
  'XRP(BSC)': '/static/token-images/xrp_binance.svg',
  'XVS(BSC)': '/static/token-images/xvs_binance.svg',
  'YFI': '/static/token-images/yfi_ethereum.svg',
  'YFL': '/static/token-images/yfl_ethereum.svg',
  'ZRX': '/static/token-images/zrx_ethereum.svg'
};