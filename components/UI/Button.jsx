import React from 'react';
import styles from './Button.module.css';

export default function Button({ children, type = 'button', variant = 'primary', fullWidth = false, ...props }) {
  const buttonClass = `${styles.btn} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`;
  
  return (
    <button type={type} className={buttonClass} {...props}>
      {children}
    </button>
  );
}