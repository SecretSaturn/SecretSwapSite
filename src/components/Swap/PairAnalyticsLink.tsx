import React from 'react';
import { useStores } from '../../stores';
import * as styles from './style.styl';

export const PairAnalyticsLink: React.FC<{ pairAddress: string }> = ({ pairAddress }) => {
  const {theme} = useStores();

  if (!pairAddress) {
    return null;
  }

  console.log(styles.analyticsLink_container)
  return (
    <div
      className={`${styles.analyticsLink_container} ${styles[theme.currentTheme]}`}
      style={{marginTop:'1rem'}}
    >
      <a className={styles.link} href={`https://secretanalytics.xyz/secretswap/${pairAddress}`} target="_blank" rel={'noreferrer'}>
        <strong>View pair analytics ↗</strong>
      </a>
    </div>
  );
};
