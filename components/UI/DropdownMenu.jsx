import React from 'react';
import styles from './DropdownMenu.module.css';

const DropdownMenu = ({ items, isOpen, className }) => {
  if (!isOpen) return null;

  return (
    <div className={`${styles.dropdownContainer} ${className || ""}`}>
      <ul className={styles.menuList}>
        {items.map((item, index) => (
          <li key={index} className={styles.menuItem} onClick={item.onClick}>
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownMenu;
