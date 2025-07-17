"use client";

import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [date, setDate] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/Calendar"); // ログイン後にカレンダーページへ遷移
    } catch (error) {
      console.error("ログイン失敗:", error);
    }
  };

  useEffect(() => {
    // 今日の日付をセット
    const today = new Date();
    const formatted = today.toLocaleDateString("ja-JP");
    setDate(formatted);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/Calendar"); // ログイン済みならカレンダーへ遷移
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>ログイン</h1>

      <div className={styles.formGroup}>
        <label>日付</label>
        <input type="text" value={date} readOnly className={styles.input} />
      </div>

      <button onClick={handleLogin} className={styles.button}>
        Googleでログイン
      </button>
    </main>
  );
}
