import React, { useEffect } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { SwapInput } from '../../../components/Swap/SwapInput';
import './styles.scss';
import cn from 'classnames';
import { IsValid } from './IsValid';
import { validateBech32Address } from '../../../blockchain-bridge';
import { Text } from '../../../components/Base';
import { ExitIcon } from '../../../ui/Icons/ExitIcon';
import { SwapToken } from '../types/SwapToken';
import { useStores } from '../../../stores';

const AddTokenButton = (props: { onClick?: any }) => {
  const {theme} = useStores();
  return (
    <button className={`addCustomToken__button`} onClick={props.onClick}>
      <Text size='small' color={(theme.currentTheme == 'light')?'dark':'#DEDEDE'}>Add custom token</Text>
    </button>
  );
};

export const AddTokenModal = (props: { tokens: SwapToken[]; token: SwapToken; addToken: any; onClick?: any }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string>('');
  const [isValidAddress, setisValidAddress] = React.useState<boolean>(false);

  useEffect(() => {
    setisValidAddress(validateBech32Address(address));
  }, [address]);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<AddTokenButton />}
      dimmer={'blurring'}
      style={{ width: '700px', display: 'flex' }}
    >
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Enter Token Address</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        <SwapInput key={address} value={address} setValue={setAddress} placeholder={'secret1.....'} width={'500px'} />
        <IsValid isValid={isValidAddress} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Add"
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            props.addToken(address);
            setOpen(false);
          }}
          positive
          disabled={!isValidAddress}
        />
      </Modal.Actions>
    </Modal>
  );
};
