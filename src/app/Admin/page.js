'use client';

import styles from './page.module.css';
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { useRouter } from 'next/navigation';

const firebaseConfig = {
  apiKey: "AIzaSyDug6k408E81owFyQNA98YjikBAqGlE7mM",
  authDomain: "pbl-c-54088.firebaseapp.com",
  projectId: "pbl-c-54088",
  storageBucket: "pbl-c-54088.appspot.com",
  messagingSenderId: "44768519903",
  appId: "1:44768519903:web:6b8a002e5981bb1300ab6a",
  measurementId: "G-D8B3QJG0G9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function AdminPage() {
  const router = useRouter();  // ←ここを追加

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // データ取得
  const fetchStudents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "students"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 削除処理
  const handleDelete = async (id) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "students", id));
      alert("削除しました");
      fetchStudents();  // 再読み込み
    } catch (e) {
      alert("削除エラー：" + e.message);
    }
  };

  if (loading) return <p className={styles.message}>読み込み中...</p>;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>管理者画面</h1>
      {students.length === 0 ? (
        <p className={styles.message}>登録データなし</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>学籍番号</th>
              <th className={styles.th}>氏名</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className={styles.row}>
                <td className={styles.td}>{student.学籍番号}</td>
                <td className={styles.td}>{student.氏名}</td>
                <td className={styles.td}>
                  <button className={styles.deletebutton} onClick={() => handleDelete(student.id)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className={styles.backButton} onClick={() => 
      {alert('ログイン画面へ戻ります');
      router.push('/')}}>
          戻る
      </button>
    </main>
  );
}
