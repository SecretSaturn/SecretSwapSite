import { action, observable } from 'mobx';
import stores, { IStores } from 'stores';
import { statusFetching } from '../constants';
import { StoreConstructor } from './core/StoreConstructor';
import * as agent from 'superagent';
import { IOperation } from './interfaces';
import { canonicalizeBalance, divDecimals, fixUnlockToken, formatWithSixDecimals, sleep, unlockToken } from '../utils';
import { BroadcastMode, SecretNetworkClient } from 'secretjs';
import {
  getFeeForExecute,
  getViewingKey,
  Snip20GetBalance,
} from '../blockchain-bridge';
import BigNumber from 'bignumber.js';
import { RewardsToken } from 'components/Earn/EarnRow';
import {config} from '../config/mainnet'

const CHAIN_ID = config.CHAIN_ID
const SECRET_LCD = config.SECRET_LCD

export const rewardsDepositKey = key => `${key}RewardsDeposit`;

export const rewardsKey = key => `${key}Rewards`;

export class UserStoreEx extends StoreConstructor {
  public declare stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  @observable public keplrWallet: any;
  @observable public keplrOfflineSigner: any;
  @observable public secretjs: SecretNetworkClient;
  @observable public secretjsSend: SecretNetworkClient;
  @observable public isKeplrWallet = false;
  @observable public error: string;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;
  @observable public balanceSCRT: string;
  @observable public balanceSSCRT: string;

  @observable public balanceToken: { [key: string]: string } = {};
  @observable public balanceTokenMin: { [key: string]: string } = {};

  @observable public balanceRewards: { [key: string]: string } = {};
  @observable public proposals: Array<{
    id: string;
    address: string;
    title: string;
    description: string;
    vote_type: string;
    author_address: string;
    author_alias: string;
    end_date: number;
    ended: boolean;
    valid: boolean;
    status: string;
  }>;
  @observable public numOfActiveProposals: number;

  @observable public scrtRate = 0;
  // @observable public ethRate = 0;

  @observable public snip20Address = '';
  @observable public snip20Balance = '';
  @observable public snip20BalanceMin = '';

  @observable public isUnconnected = '';
  @observable public isInfoReading = false;
  @observable public isInfoEarnReading = false;
  @observable public isMaintenanceOpen = false;
  @observable public chainId: string;
  @observable public isModalOpen = false;
  @observable public ws: WebSocket;

  constructor(stores) {
    super(stores);
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Key store in Keplr is changed. Reloading page');
      window.location.reload();
    });
    // setInterval(() => this.getBalances(), 15000);

    // Load tokens from DB
    this.stores.tokens.init();
    this.stores.tokens.filters = {};
    this.stores.tokens.fetch();

    const session = localStorage.getItem('keplr_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj) {
      this.address = sessionObj.address;
      this.isInfoReading = sessionObj.isInfoReading;
      this.isInfoEarnReading = sessionObj.isInfoEarnReadingSecret3;
      this.keplrCheckPromise.then(async () => {
        await this.signIn();

        this.getRates();
        this.getBalances();

        //this.websocketInit();
      });
    } else {
      console.log("Couln't find a session");
      this.isUnconnected = 'true';
    }
  }

  public keplrCheckPromise = new Promise<void>((accept, _reject) => {
    // 1. Every one second, check if Keplr was injected to the page
    const keplrCheckInterval = setInterval(async () => {
      this.isKeplrWallet =
        // @ts-ignore
        !!window.keplr &&
        // @ts-ignore
        !!window.getOfflineSigner &&
        // @ts-ignore
        !!window.getEnigmaUtils;
      // @ts-ignore
      this.keplrWallet = window.keplr;

      if (this.isKeplrWallet) {
        // Keplr is present, stop checking
        clearInterval(keplrCheckInterval);
        accept();
      } else {
        console.log('Keplr is not installed');
        this.isUnconnected = 'UNINSTALLED';
      }
    }, 1000);
  });
  @action public setSnip20Balance(balance: string) {
    this.snip20Balance = balance;
  }

  @action public setSnip20BalanceMin(balance: string) {
    this.snip20BalanceMin = balance;
  }
  @action public setModalOpen(open: boolean) {
    this.isModalOpen = open;
  }
  @action public setMaintenanceModal(open: boolean) {
    this.isMaintenanceOpen = open;
  }
  @action public async websocketTerminate(waitToBeOpen?: boolean) {
    if (waitToBeOpen) {
      while (!this.ws && this.ws.readyState !== WebSocket.OPEN) {
        await sleep(100);
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000 /* Normal Closure */, 'Ba bye');
    }
  }

  @action public async websocketInit() {
    if (this.ws) {
      while (this.ws.readyState === WebSocket.CONNECTING) {
        await sleep(100);
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1012 /* Service Restart */, 'Refreshing connection');
      }
    }

    this.ws = new WebSocket(globalThis.config.SECRET_WS);

    const symbolUpdateHeightCache: { [symbol: string]: number } = {};

    this.ws.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);

        const symbol = data.id;

        if (!(symbol in symbolUpdateHeightCache)) {
          console.error(symbol, 'not in symbolUpdateHeightCache:', symbolUpdateHeightCache);
          return;
        }

        let height = 0;
        try {
          height = Number(data.result.data.value.TxResult.height);
        } catch (error) {
          // Not a tx
          // Probably just the /subscribe ok event
          return;
        }

        if (height <= symbolUpdateHeightCache[symbol]) {
          console.log('Already updated', symbol, 'for height', height);
          return;
        }
        symbolUpdateHeightCache[symbol] = height;
        //await this.updateBalanceForSymbol(symbol);
      } catch (error) {
        console.log(`Error parsing websocket event: ${error}`);
      }
    };

    this.ws.onopen = async () => {
      while (this.stores.tokens.allData.length === 0) {
        await sleep(100);
      }

      while (!this.address.startsWith('secret')) {
        await sleep(100);
      }

      for (const token of this.stores.rewards.allData) {
        // For any tx on this token's address or rewards pool => update my balance
        const symbol = token.inc_token.symbol.replace('s', '');

        symbolUpdateHeightCache[symbol] = 0;

        const tokenQueries = [
          `message.contract_address='${token.inc_token.address}'`,
          `wasm.contract_address='${token.inc_token.address}'`,
          `message.contract_address='${token.pool_address}'`,
          `wasm.contract_address='${token.pool_address}'`,
        ];

        for (const query of tokenQueries) {
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: symbol, // jsonrpc id
              method: 'subscribe',
              params: { query },
            }),
          );
        }
      }

      // Also hook sSCRT
      symbolUpdateHeightCache['sSCRT'] = 0;
      const secretScrtQueries = [
        `message.contract_address='${globalThis.config.SSCRT_CONTRACT}'`,
        `wasm.contract_address='${globalThis.config.SSCRT_CONTRACT}'`,
      ];

      for (const query of secretScrtQueries) {
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'sSCRT', // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
      }

      symbolUpdateHeightCache['SCRT'] = 0;
      const scrtQueries = [
        `message.sender='${this.address}'` /* sent a tx (gas) */,
        `message.signer='${this.address}'` /* executed a contract (gas) */,
        `transfer.recipient='${this.address}'` /* received SCRT */,
      ];

      for (const query of scrtQueries) {
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'SCRT', // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
      }
    };
  }

  @action public setInfoReading() {
    this.isInfoReading = true;
    this.syncLocalStorage();
  }

  @action public setInfoEarnReading() {
    this.isInfoEarnReading = true;
    this.syncLocalStorage();
  }

  @action public async signIn(wait?: boolean) {
    try {
      this.error = '';

      while (wait || !this.keplrWallet) {
        console.log('Waiting for Keplr...');
        await sleep(100);
      }
      console.log('Found Keplr', CHAIN_ID);

      this.chainId = CHAIN_ID;

      // Ask the user for permission
      await this.keplrWallet.enable(this.chainId);

      // @ts-ignore
      this.keplrOfflineSigner = window.getOfflineSigner(this.chainId);
      const accounts = await this.keplrOfflineSigner.getAccounts();
      this.address = accounts[0].address;
      this.isAuthorized = true;
      this.secretjsSend = this.initSecretJS(SECRET_LCD, true);
      this.secretjs = this.initSecretJS(SECRET_LCD, false);
      await this.updateScrtBalance();
      this.isUnconnected = '';
    } catch (error) {
      this.isUnconnected = 'true';
      console.error(error);
    }
  }

  initSecretJS = (address: string, isSigner: boolean) => {
    console.log(address, this.chainId, this.address, this.keplrOfflineSigner)
    try {
      const client = isSigner
        ? new SecretNetworkClient(
            {url: address,
            chainId: this.chainId,
            walletAddress: this.address,
            wallet:this.keplrOfflineSigner,
            encryptionUtils: (window as any).keplr?.getEnigmaUtils(this.chainId)}
          )
        : new SecretNetworkClient({
            url: address,
            chainId: this.chainId,
            walletAddress: this.address
        });
      this.syncLocalStorage();
      this.getBalances();
      return client;
    } catch (error) {
      this.error = error.message;
      this.isAuthorized = false;
      console.error('keplr login error', error);
      return undefined;
    }
  };

  @action public getSnip20Balance = async (snip20Address: string, decimals?: string | number): Promise<string> => {
    await this.prepareDeps();

    if (!this.secretjs) {
      return '0';
    }

    const viewingKey = await getViewingKey({
      keplr: this.keplrWallet,
      chainId: this.chainId,
      address: snip20Address,
    });

    if (!viewingKey) {
      return unlockToken;
    }

    const rawBalance = await Snip20GetBalance({
      secretjs: this.secretjs,
      token: snip20Address,
      address: this.address,
      key: viewingKey,
    });

    if (isNaN(Number(rawBalance))) {
      return fixUnlockToken;
    }

    if (decimals) {
      const decimalsNum = Number(decimals);
      return divDecimals(rawBalance, decimalsNum);
    }

    return rawBalance;
  };


  @action public getBalances = async () => {
    await Promise.all([this.updateBalanceForSymbol('SCRT'), this.updateBalanceForSymbol('sSCRT')]);
  };

  @action public updateScrtBalance = async () => {
    try {
      console.log(this.secretjs.address)
      const result = await this.secretjs.query.bank.balance({
        denom: "uscrt",
        address: this.secretjs.address,
      });
      this.balanceSCRT = formatWithSixDecimals(divDecimals(result.balance.amount, 6));
    } catch (e) {
      this.balanceSCRT = '0';
    }
    return;
  };

  @action public updateSScrtBalance = async () => {
    try {
      const balance = await this.getSnip20Balance(globalThis.config.SSCRT_CONTRACT, 6);
      this.balanceToken[globalThis.config.SSCRT_CONTRACT] = balance;
    } catch (err) {
      this.balanceToken[globalThis.config.SSCRT_CONTRACT] = unlockToken;
    }

    const token = this.stores.tokens.allData.find(t => t.display_props.symbol === 'SSCRT');

    if (!token) {
      return;
    }

    try {
      this.balanceTokenMin[globalThis.config.SSCRT_CONTRACT] = token.display_props.min_from_scrt;
    } catch (e) {
      console.log(`unknown error: ${e}`);
    }
    return;
  };

  @action public updateBalanceForRewardsToken = async (tokenAddress: string) => {
    while (!this.address && !this.secretjs && this.stores.tokens.isPending) {
      await sleep(100);
    }
  };

  @action public updateBalanceForSymbol = async (symbol: string) => {
    while (!this.address || !this.secretjs || this.stores.tokens.allData.length === 0) {
      await sleep(100);
    }

    if (!symbol) {
      return;
    } else if (symbol === 'SCRT') {
      await this.updateScrtBalance();
    }

    //console.log(symbol)

    await this.refreshTokenBalance(symbol);

    //await this.refreshRewardsBalances(symbol);
  };


  prepareDeps = async () => {
    await this.keplrCheckPromise;
    this.secretjs = this.secretjs || this.initSecretJS(SECRET_LCD, false);
  };


  public async getIsSupported(pairAddress: string): Promise<boolean> {
    try {
      if (pairAddress) {
        let { is_supported: result } = await this.secretjs.queryContractSmart(globalThis.config.MINTER_CONTRACT, {
          is_supported: { pair: pairAddress },
        });
        return result?.is_supported;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  private async refreshTokenBalance(symbol: string) {
    const token = this.stores.tokens.allData.find(t => t.display_props.symbol === symbol);

    // console.log(token)
    if (!token) {
      return;
    }

    try {
      const balance = await this.getSnip20Balance(token.dst_address, token.decimals);
      this.balanceToken[token.dst_address] = balance;
    } catch (err) {
      this.balanceToken[token.dst_address] = unlockToken;
    }

    try {
      this.balanceTokenMin[token.dst_address] = token.display_props.min_from_scrt;
    } catch (e) {
      console.log(`unknown error: ${e}`);
    }
  }
  async refreshTokenBalanceByAddress(address: string) {
    const token = this.stores.tokens.allData.find(t => t.dst_address === address);

    // console.log(token)
    if (!token) {
      return;
    }

    try {
      const balance = await this.getSnip20Balance(token.dst_address, token.decimals);
      this.balanceToken[token.dst_address] = balance;
    } catch (err) {
      this.balanceToken[token.dst_address] = unlockToken;
    }

    try {
      this.balanceTokenMin[token.dst_address] = token.display_props.min_from_scrt;
    } catch (e) {
      console.log(`unknown error: ${e}`);
    }
  }


  @action public signOut() {
    this.isAuthorized = false;
    this.address = null;
    this.syncLocalStorage();
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'keplr_session',
      JSON.stringify({
        address: this.address,
        isInfoReading: this.isInfoReading,
        isInfoEarnReadingSecret3: this.isInfoEarnReading,
      }),
    );
  }

  @action public signTransaction(txn: any) {
    /*  if (this.sessionType === 'mathwallet' && this.isKeplrWallet) {
      return this.keplrWallet.signTransaction(txn);
    } */
  }

  public saveRedirectUrl(url: string) {
    if (!this.isAuthorized && url) {
      this.redirectUrl = url;
    }
  }

  @action public async getRates() {
    // this.rates = Object.assign(
    //   {},
    //   ...this.stores.tokens.allData
    //     .filter(token => token.src_address === 'native')
    //     .map(token => {
    //       let network = networkFromToken(token);
    //       return {
    //         [network]: token.price,
    //       };
    //     }),
    // );

    this.scrtRate = Number(
      this.stores.tokens.allData.find(token => token.display_props.symbol.toUpperCase() === 'SSCRT')?.price,
    );

    // fallback to binance prices
    if (isNaN(this.scrtRate) || this.scrtRate === 0) {
      const scrtbtc = await agent.get<{ body: IOperation }>(
        'https://api.binance.com/api/v1/ticker/24hr?symbol=SCRTBTC',
      );
      const btcusdt = await agent.get<{ body: IOperation }>(
        'https://api.binance.com/api/v1/ticker/24hr?symbol=BTCUSDT',
      );

      this.scrtRate = scrtbtc.body.lastPrice * btcusdt.body.lastPrice;
    }
  }

  @action public async getRewardToken(tokenAddress: string): Promise<RewardsToken> {
    try {
      stores.rewards.init({
        isLocal: true,
        sorter: 'none',
        pollingInterval: 20000,
      });
      stores.rewards.fetch();
      stores.tokens.init();
      const getFilteredTokens = async () => {
        if (stores.tokens.allData.length > 0) {
          await sleep(500);
          return stores.tokens.tokensUsageSync('LPSTAKING');
        } else {
          return undefined;
        }
      };

      while (stores.rewards.isPending) {
        await sleep(100);
      }
      const filteredTokens = await getFilteredTokens();
      const mappedRewards = stores.rewards.allData
        .filter(rewards => filteredTokens?.find(element => element.dst_address === rewards.inc_token.address))
        .map(reward => {
          return { reward, token: filteredTokens?.find(element => element.dst_address === reward.inc_token.address) };
        });
      while (!stores.user.secretjs || stores.tokens.isPending) {
        await sleep(100);
      }
      await stores.user.refreshTokenBalanceByAddress(tokenAddress);
      const reward_tokens = mappedRewards
        .slice()
        .filter(rewardToken => (globalThis.config.TEST_COINS || !rewardToken.reward.hidden))
        //@ts-ignore
        .map(rewardToken => {
          const rewardsToken: RewardsToken = {
            rewardsContract: rewardToken.reward.pool_address,
            lockedAsset: rewardToken.reward.inc_token.symbol,
            lockedAssetAddress: rewardToken.token.dst_address,
            totalLockedRewards: divDecimals(
              Number(rewardToken.reward.total_locked) * Number(rewardToken.reward.inc_token.price),
              rewardToken.reward.inc_token.decimals,
            ),
            rewardsDecimals: String(rewardToken.reward.rewards_token.decimals),
            rewards: stores.user.balanceRewards[rewardsKey(rewardToken.token.dst_address)],
            deposit: stores.user.balanceRewards[rewardsDepositKey(rewardToken.token.dst_address)],
            balance: stores.user.balanceToken[rewardToken.token.dst_address],
            decimals: rewardToken.token.decimals,
            name: rewardToken.token.name,
            price: String(rewardToken.reward.inc_token.price),
            rewardsPrice: String(rewardToken.reward.rewards_token.price),
            display_props: rewardToken.token.display_props,
            remainingLockedRewards: rewardToken.reward.pending_rewards,
            deadline: Number(rewardToken.reward.deadline),
            rewardsSymbol: rewardToken.reward.rewards_token.symbol,
          };

          if (rewardsToken.rewardsContract === tokenAddress) {
            return rewardsToken;
          }
        });
      return reward_tokens.filter(e => e !== undefined)[0];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async getTVL(contractAddress: string): Promise<any> {
    const client = this.secretjs || this.initSecretJS(globalThis.config.SECRET_LCD, false);
    const locked = (await client.queryContractSmart(contractAddress, { total_locked: {} })).amount;

    return locked || 100000000000;
  }
}
