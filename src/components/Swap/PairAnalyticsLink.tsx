import React from 'react';
import { useStores } from '../../stores';
import './style.scss';

export const PairAnalyticsLink: React.FC<{ pairAddress: string }> = ({ pairAddress }) => {
  const {theme} = useStores();

  if (!pairAddress) {
    return null;
  }

  return (
    <div
      className={`analyticsLink_container`}
      style={{marginTop:'1rem'}}
    >
      <a className={'link'} href={`https://secretanalytics.xyz/secretswap/${pairAddress}`} target="_blank" rel={'noreferrer'}>
        <strong>View pair analytics ↗</strong>
      </a>
    </div>
  );
};
