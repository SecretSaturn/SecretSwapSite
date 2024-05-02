import React from 'react'
import { useHistory, Link } from 'react-router-dom'
import  "./sideNav.scss";
import { useStores } from '../../stores';

const SideNav = (props) => {
  const history = useHistory();
  const { theme } = useStores();
  const isSwap = history.location.pathname === '/swap';
  const isPool = history.location.pathname === '/pool';

  return (
    <nav>
      <div className={`${theme.currentTheme} sidenav`}>
          <ul>
              <li className={isSwap ? 'active':''}><Link to={"/swap"}>Swap</Link></li>
              <li  className={isPool ? 'active hide_mobile':'hide_mobile'}><Link to={"/pool"}>Pool</Link></li>
              <li className={`btn-secondary`}>
                <Link to="/buy">Buy SCRT</Link>
              </li>
          </ul>
      </div>
    </nav>
  )
}

export default SideNav