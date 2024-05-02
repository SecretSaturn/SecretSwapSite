import RouterStore from './RouterStore';
import { ActionModalsStore } from './ActionModalsStore';
import { UserStoreEx } from './UserStore';
import { Operations } from './Operations';
import { Tokens } from './Tokens';
import { createStoresContext } from './create-context';
import { Rewards } from './RewardsStore';
import { SecretSwapPairs } from './SecretSwapPairs';
import { SignerHealthStore } from './SignerHealthStore';
import { SecretSwapPools } from './SecretSwapPools';
import Theme from '../themes/index';

export interface IStores {
  routing?: RouterStore;
  actionModals?: ActionModalsStore;
  user?: UserStoreEx;
  operations?: Operations;
  tokens?: Tokens;
  rewards?: Rewards;
  secretSwapPairs?: SecretSwapPairs;
  secretSwapPools?: SecretSwapPools;
  signerHealth?: SignerHealthStore;
  theme?: Theme;
}

const stores: IStores = {};

stores.routing = new RouterStore();
stores.operations = new Operations(stores);
stores.tokens = new Tokens(stores);
stores.actionModals = new ActionModalsStore();
stores.user = new UserStoreEx(stores);
stores.rewards = new Rewards(stores);
stores.secretSwapPairs = new SecretSwapPairs(stores);
stores.secretSwapPools = new SecretSwapPools(stores);
stores.signerHealth = new SignerHealthStore(stores);
stores.theme = new Theme();


if (!globalThis.config.production) {
  globalThis.stores = stores;
}

const { StoresProvider, useStores } = createStoresContext<typeof stores>();
export { StoresProvider, useStores };

export default stores;
