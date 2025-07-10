'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  // あなたのfirebaseConfigをここに
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function AdminPage() {
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

  if (loading) return <p>読み込み中...</p>;

  return (
    <main>
      <h1>管理者画面</h1>
      {students.length === 0 ? (
        <p>登録データなし</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>学籍番号</th>
              <th>氏名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.学籍番号}</td>
                <td>{student.氏名}</td>
                <td>
                  <button onClick={() => handleDelete(student.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}