'use client';

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
    <main style={styles.container}>
      <h2>新規登録</h2>

      <div style={styles.formGroup}>
        <label>日付</label>
        <input type="text" value={date} readOnly style={styles.input} />
      </div>

      <div style={styles.formGroup}>
        <label>学籍ID</label>
        <input type="text" placeholder="学籍IDを入力" style={styles.input} />
      </div>

      <div style={styles.formGroup}>
        <label>氏名</label>
        <input type="text" placeholder="氏名を入力" readOnly style={styles.input} />
      </div>

      <div style={styles.formGroup}>
        <label>パスワード</label>
        <input type="password" placeholder="パスワードを入力" style={styles.input} />
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.button}>新規登録</button>
        <button style={{ ...styles.button, backgroundColor: '#888' }} onClick={() => router.push('/')}>戻る</button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontFamily: 'sans-serif',
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #aaa',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
