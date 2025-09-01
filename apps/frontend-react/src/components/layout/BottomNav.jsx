import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

// 导入图标 - 使用正确的路径
import HomeIcon from '../../assets/img/homebar/home.svg?url';
import HomeActiveIcon from '../../assets/img/homebar/home_active.svg?url';
import QimenIcon from '../../assets/img/homebar/qimen.svg?url';
import QimenActiveIcon from '../../assets/img/homebar/qimen_active.svg?url';
import GuanyuIcon from '../../assets/img/homebar/guanyu.svg?url';
import GuanyuActiveIcon from '../../assets/img/homebar/guanyu_active.svg?url';
import WodeIcon from '../../assets/img/homebar/wode.svg?url';
import WodeActiveIcon from '../../assets/img/homebar/wode_active.svg?url';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        <NavLink to="/home" className="nav-item">
          {({ isActive }) => (
            <>
              <div className="nav-icon home-icon">
                <img 
                  src={isActive ? HomeActiveIcon : HomeIcon}
                  alt="首页"
                  width="24"
                  height="24"
                />
              </div>
              <span className="nav-text">首页1</span>
            </>
          )}
        </NavLink>

        <NavLink to="/qimen" className="nav-item">
          {({ isActive }) => (
            <>
              <div className="nav-icon">
                <img 
                  src={isActive ? QimenActiveIcon : QimenIcon}
                  alt="奇门"
                  width="24"
                  height="24"
                />
              </div>
              <span className="nav-text">奇门</span>
            </>
          )}
        </NavLink>

        <NavLink to="/settings" className="nav-item">
          {({ isActive }) => (
            <>
              <div className="nav-icon">
                <img 
                  src={isActive ? GuanyuActiveIcon : GuanyuIcon}
                  alt="设置"
                  width="24"
                  height="24"
                />
              </div>
              <span className="nav-text">设置</span>
            </>
          )}
        </NavLink>

        <NavLink to="/profile" className="nav-item">
          {({ isActive }) => (
            <>
              <div className="nav-icon">
                <img 
                  src={isActive ? WodeActiveIcon : WodeIcon}
                  alt="我的"
                  width="24"
                  height="24"
                />
              </div>
              <span className="nav-text">我的</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav; 