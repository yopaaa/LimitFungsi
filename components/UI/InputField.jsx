import React from 'react';
import styles from './InputField.module.css';

export default function InputField({ label, id, type = 'text', placeholder, error, ...props }) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}