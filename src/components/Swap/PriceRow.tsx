import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import './style.scss';
import { FlexRowSpace } from './FlexRowSpace';
import { useStores } from '../../stores';
import BigNumber from 'bignumber.js';
import { formatSignificantFigures } from 'utils';

export const PriceRow = ({ price, fromToken, toToken, labelPrefix }: { price: BigNumber, fromToken: string, toToken: string, labelPrefix?: string }) => {
  const { theme } = useStores();
  const [iconBackground, setIconBackground] = useState('whitesmoke');
  const [isPriceInverse, setIsPriceInverse] = useState(true);

  const displayPrice = isPriceInverse ? price.pow(-1) : price;
  const displayLeftToken = isPriceInverse ? toToken : fromToken;
  const displayRightToken = isPriceInverse ? fromToken : toToken;

  return (
    <div className={`priceRow_container`}>
      <span style={{marginRight: '0.5rem'}}>{labelPrefix}Price</span>
      <FlexRowSpace/>
      {`${formatSignificantFigures(displayPrice, 8)} ${displayLeftToken} per ${displayRightToken}`}
      <Icon
        circular
        size="small"
        name="exchange"
        style={{
          margin: '0 0 0 0.3em',
          background: theme.currentTheme == 'light' ? iconBackground : 'rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIconBackground('rgb(237, 238, 242)')}
        onMouseLeave={() => setIconBackground('whitesmoke')}
        onClick={() => setIsPriceInverse(!isPriceInverse)}
      />
    </div>
  );
};
