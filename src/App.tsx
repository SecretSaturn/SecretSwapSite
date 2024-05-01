import React, { Suspense } from 'react';
import './config/base'
import { baseTheme } from './themes/index';
import { GlobalStyle } from './GlobalStyle';
import { Providers } from './Providers';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ActionModals } from './components/ActionModals';
import { SwapPageWrapper } from './pages/Swap';
import { SwapPagePool } from './pages/Pool';
import { InfoModal } from './components/InfoModal';
import './notifications.css'

export const App: React.FC = () => (
  <Providers>
    <Suspense fallback={<div />}>
      <Switch>
        <Route path="/swap" component={SwapPageWrapper} />
        <Route path="/pool" component={SwapPagePool} />
        <Redirect to="/swap" />
      </Switch>
    </Suspense>
    <ActionModals />
    <InfoModal />
    <GlobalStyle theme={baseTheme as any} />
  </Providers>
);
