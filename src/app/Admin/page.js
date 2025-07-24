"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../../firebase"; // ←firebase設定ファイルに合わせて調整
import styles from "./page.module.css";

export default function AdminPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null); // 追加: ユーザーのメールを保持

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.push("/"); // 未認証ならトップへ
    } else {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserEmail(user.email); // メールを保存
        }
      });
      fetchStudents();
      setAuthLoading(false);
      return () => unsubscribe(); // クリーンアップ
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Firebaseからサインアウト
    } catch (error) {
      console.error("Firebaseログアウトエラー:", error);
    }
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  if (authLoading) {
    return <p>読み込み中...</p>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>管理者ページ</h1>

      {userEmail && <p>ログイン中: {userEmail}</p>}

      <button onClick={handleLogout} className={styles.button}>
        ログアウト
      </button>

      <ul className={styles.list}>
        {students.map((student) => (
          <li key={student.id} className={styles.listItem}>
            <span>{student.name}</span>
            <button onClick={() => handleDelete(student.id)} className={styles.deleteButton}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
