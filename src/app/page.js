'use client';

import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

// Firebase初期化（libに分けてもOK）
const firebaseConfig = {
  apiKey: "AIzaSyDug6k408E81owFyQNA98YjikBAqGlE7mM",
  authDomain: "pbl-c-54088.firebaseapp.com",
  projectId: "pbl-c-54088",
  storageBucket: "pbl-c-54088.firebasestorage.app",
  messagingSenderId: "44768519903",
  appId: "1:44768519903:web:6b8a002e5981bb1300ab6a",
  measurementId: "G-D8B3QJG0G9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('ja-JP');
    setDate(formatted);
  }, []);

  // ログイン処理例（Firestoreに該当学籍番号とパスワードがあれば成功とみなす簡易版）
  const handleLogin = async () => {
    if (!studentId || !password) {
      setMessage("学籍IDとパスワードを入力してください");
      return;
    }

    try {
      // 学籍番号とパスワードで検索
      const q = query(collection(db, "students"), where("学籍番号", "==", studentId), where("パスワード", "==", password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("学籍IDかパスワードが間違っています");
      } else {
        // 氏名をstateにセット（Firestoreから取得）
        const doc = querySnapshot.docs[0];
        setName(doc.data().氏名);
        setMessage("ログイン成功！");
        // ログイン後の処理（画面遷移など）
        router.push('/Calender');
      }
    } catch (error) {
      setMessage("ログイン処理中にエラーが発生しました");
      console.error(error);
    }
  };

  return (
    <main className={styles.container}>
      <h2>ログイン</h2>

      <div className={styles.formGroup}>
        <label>日付</label>
        <input type="text" value={date} readOnly className={styles.input} />
      </div>

      <div className={styles.formGroup}>
        <label>学籍ID</label>
        <input
  type="text"
  placeholder="学籍IDを入力"
  className={styles.input}
  value={studentId}
  onChange={(e) => {
    // 入力値から半角英数字以外を除去
    const filtered = e.target.value.replace(/[^0-9a-zA-Z]/g, '');
    setStudentId(filtered);
  }}
/>

      </div>

      <div className={styles.formGroup}>
        <label>氏名</label>
        <input type="text"
        placeholder="氏名を入力"
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
  <label>パスワード</label>
  <input
    type="password"
    placeholder="パスワードを入力"
    className={styles.input}
    value={password}
    onChange={(e) => {
      // 入力値から半角英数字以外を除去
      const filtered = e.target.value.replace(/[^0-9a-zA-Z!@#$%]/g, '');
      setPassword(filtered);
    }}
  />
</div>


      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={handleLogin}>ログイン</button>
        <button
          className={styles.button}
          style={{ backgroundColor: '#888' }}
          onClick={() => router.push('/Register')}
        >
          新規登録
        </button>
      </div>

      <p style={{ color: message.includes("成功") ? "green" : "red" }}>{message}</p>
    </main>
  );
}
