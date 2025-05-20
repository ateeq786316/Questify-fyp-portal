import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './InternalSidebar.module.css';

const menuItems = [
  { to: '/internaldashboard', icon: '🏠', text: 'Home' },
  { to: '#about', icon: 'ℹ️', text: 'About', hash: true },
];

const InternalSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '80px' : '250px'
    );
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [isCollapsed]);

  return (
    <div
      className={
        styles['internal-sidebar'] + (isCollapsed ? ' ' + styles['internal-sidebar--collapsed'] : '')
      }
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <h2 className={
        styles['internal-sidebar__title'] + (isCollapsed ? ' ' + styles['internal-sidebar__title--hidden'] : '')
      }>
        Internal Dashboard
      </h2>
      <ul className={styles['internal-sidebar__menu']}>
        {menuItems.map((item) => {
          const isActive = item.hash
            ? location.hash === item.to
            : location.pathname === item.to;
          return (
            <li
              key={item.to}
              className={
                styles['internal-sidebar__item'] +
                (isActive ? ' ' + styles['internal-sidebar__item--active'] : '')
              }
            >
              <Link to={item.to} className={styles['internal-sidebar__link']}>
                <span className={styles['internal-sidebar__icon']}>{item.icon}</span>
                {!isCollapsed && (
                  <span className={styles['internal-sidebar__text']}>{item.text}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InternalSidebar; 