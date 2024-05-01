import * as React from 'react';
import stores, { StoresProvider } from './stores/index';
import { Router } from 'react-router-dom';
import { Provider as MobxProvider } from 'mobx-react';
import { Grommet } from 'grommet';
import { Theme, baseTheme } from './themes/index';

export const Providers: React.FC = ({ children }) => (
  <StoresProvider stores={stores as any}>
    <MobxProvider {...stores}>
      <Grommet style={{height:'auto'}} theme={{ ...Theme, ...baseTheme }} plain={true} full={true} id="grommetRoot">
        <Router history={stores.routing.history}>{children}</Router>
      </Grommet>
    </MobxProvider>
  </StoresProvider>
);
