'use client';

import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('ja-JP');
    setDate(formatted);
  }, []);

  return (
    <main className={styles.container}>
      <h2>ログイン</h2>

      <div className={styles.formGroup}>
        <label>日付</label>
        <input type="text" value={date} readOnly className={styles.input} />
      </div>

      <div className={styles.formGroup}>
        <label>学籍ID</label>
        <input type="text" placeholder="学籍IDを入力" className={styles.input} />
      </div>

      <div className={styles.formGroup}>
        <label>氏名</label>
        <input type="text" placeholder="氏名を入力" readOnly className={styles.input} />
      </div>

      <div className={styles.formGroup}>
        <label>パスワード</label>
        <input type="password" placeholder="パスワードを入力" className={styles.input} />
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={() => router.push('/Calender')}>ログイン</button>
        <button
          className={styles.button}
          style={{ backgroundColor: '#888' }}
          onClick={() => router.push('/Register')}
        >
          新規登録
        </button>
      </div>
    </main>
  );;
};
