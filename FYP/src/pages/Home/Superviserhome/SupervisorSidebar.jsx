import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './SupervisorSidebar.module.css';

const menuItems = [
  { to: '/supervisordashboard', icon: '🏠', text: 'Home' },
  { to: '/supervisor/reviewdocument', icon: '📄', text: 'Review Document' },
  { to: '/supervisor/evaluate', icon: '✅', text: 'Evaluate' },
  // { to: '/supervisor/communication', icon: '💬', text: 'Communication' },
  { to: '#about', icon: 'ℹ️', text: 'About', hash: true },
];

const SupervisorSidebar = () => {
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
        styles['supervisor-sidebar'] + (isCollapsed ? ' ' + styles['supervisor-sidebar--collapsed'] : '')
      }
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <h2 className={
        styles['supervisor-sidebar__title'] + (isCollapsed ? ' ' + styles['supervisor-sidebar__title--hidden'] : '')
      }>
        Supervisor Dashboard
      </h2>
      <ul className={styles['supervisor-sidebar__menu']}>
        {menuItems.map((item) => {
          const isActive = item.hash
            ? location.hash === item.to
            : location.pathname === item.to;
          return (
            <li
              key={item.to}
              className={
                styles['supervisor-sidebar__item'] +
                (isActive ? ' ' + styles['supervisor-sidebar__item--active'] : '')
              }
            >
              <Link to={item.to} className={styles['supervisor-sidebar__link']}>
                <span className={styles['supervisor-sidebar__icon']}>{item.icon}</span>
                {!isCollapsed && (
                  <span className={styles['supervisor-sidebar__text']}>{item.text}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SupervisorSidebar; 