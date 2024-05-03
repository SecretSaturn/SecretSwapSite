import React from 'react';
import { Modal } from 'semantic-ui-react';
import { TokenInfoRow } from './TokenInfoRow';
import { TokenSelectorButton } from './TokenSelectorButton';
import { AddTokenModal } from './AddTokenModal';
import { GetSnip20Params, Snip20TokenInfo } from '../../../blockchain-bridge';
import LocalStorageTokens from '../../../blockchain-bridge/scrt/CustomTokens';
import Loader from 'react-loader-spinner';
import { ClearCustomTokensButton } from './ClearCustomTokens';
import { ExitIcon } from '../../../ui/Icons/ExitIcon';
import { SwapToken, SwapTokenFromSnip20Params } from '../types/SwapToken';
import cn from 'classnames';
import './styles.scss';
import { useStores } from '../../../stores';
import Scrollbars from 'react-custom-scrollbars';
import { SecretNetworkClient } from 'secretjs';

export const TokenSelector = (props: {
  secretjs: SecretNetworkClient;
  tokens: SwapToken[];
  token?: SwapToken;
  onClick?: any;
  notify?: CallableFunction;
}) => {
  const [open, setOpen] = React.useState(false);
  const [localToken, setLocalToken] = React.useState<string>('');
  const [localStorageTokens, setLocalStorageToken] = React.useState<SwapToken[]>(null);
  const [searchText, setSearchText] = React.useState<string>('');

  React.useEffect(() => {
    const addToken = async () => {
      if (localToken) {
        const tokenInfo: Snip20TokenInfo = await GetSnip20Params({
          secretjs: props.secretjs,
          address: localToken,
        });

        const customTokenInfo = SwapTokenFromSnip20Params(localToken, tokenInfo);

        LocalStorageTokens.store(customTokenInfo);
        setLocalStorageToken(LocalStorageTokens.get());
      }
    };
    addToken().catch(/* todo: add notification of failures */);
  }, [props.secretjs, localToken]);

  const filteredTokens = props.tokens.filter(t => {
    return (t.symbol + String(t.address)).toLowerCase().includes(searchText);
  });
  const renderThumbVertical = () => {
    return <div className={`thumb theme.currentTheme}`}></div>;
  };
  const { theme } = useStores();
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<TokenSelectorButton token={props.token} />}
      dimmer={'blurring'}
      id={'modal_container'}
    >
      <Modal.Header
        style={{
          border: 'none',
          background: theme.currentTheme == 'light' ? 'white' : '#0E0E10',
          color: theme.currentTheme == 'light' ? '#5F5F6B' : '#DEDEDE',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Select a token</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content
        style={{
          padding: '0 0 0 0',
          background: theme.currentTheme == 'light' ? 'white' : '#0E0E10',
          color: theme.currentTheme == 'light' ? '#5F5F6B' : '#DEDEDE',
        }}
      >
        {props.tokens.length > 0 ? (
          <div style={{ display: 'flex', margin: '0 1rem' }}>
            <input
              onKeyDown={event => {
                if (event.key === 'Enter' && filteredTokens.length === 1) {
                  props?.onClick(filteredTokens[0].address);
                  setOpen(false);
                  setSearchText('');
                }
              }}
              autoFocus
              className={`tokenSelectorSearch`}
              placeholder="Search symbol or paste address"
              onChange={e => setSearchText(e.target.value.trim().toLowerCase())}
            />
          </div>
        ) : null}
        {props.tokens.length > 0 ? (
          filteredTokens.length === 0 ? (
            <div className={`listTokens__container`}>
              <h4>No results found.</h4>
            </div>
          ) : (
            <div className={`listTokens__container`}>
              <Scrollbars
                autoHide
                renderThumbVertical={renderThumbVertical}
                className='listTokens__subcontainer'
              >
                {filteredTokens
                  .slice()
                  .sort((a, b) => {
                    /* sSCRT first */
                    if (a.symbol === 'sSCRT') {
                      return -1;
                    }
                    if (b.symbol === 'sSCRT') {
                      return 1;
                    }

                    if (b.symbol === 'SCRT') {
                      return 1;
                    }

                    /* then SEFI */
                    if (a.symbol === 'SEFI') {
                      return -1;
                    }
                    if (b.symbol === 'SEFI') {
                      return 1;
                    }

                    const aSymbol = a.symbol.replace(/^s/, '');
                    const bSymbol = b.symbol.replace(/^s/, '');

                    return aSymbol.localeCompare(bSymbol);
                  })
                  .map(t => {
                    return (
                      <TokenInfoRow
                        key={t.identifier}
                        token={t}
                        onClick={() => {
                          props?.onClick ? props.onClick(t.identifier) : (() => {})();
                          setOpen(false);
                          setSearchText('');
                        }}
                      />
                    );
                  })}
              </Scrollbars>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
          </div>
        )}
      </Modal.Content>
      <Modal.Actions
        id='actions'
        style={{
          borderTop: 'none',
          background: theme.currentTheme == 'light' ? 'white' : '#0E0E10',
          color: theme.currentTheme == 'light' ? '#5F5F6B' : '#DEDEDE',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <ClearCustomTokensButton />
        <AddTokenModal tokens={props.tokens} token={props.token} addToken={address => setLocalToken(address)} />
      </Modal.Actions>
    </Modal>
  );
};
