"use client";

import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adminClickCount, setAdminClickCount] = useState(0);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/Calendar");
    } catch (error) {
      console.error("ログイン失敗:", error);
    }
  };

   const handleHiddenClick = () => {
    setAdminClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        router.push("/Adminlogin");
      }
      return newCount;
    });
  };

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("ja-JP");
    setDate(formatted);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/Calendar");
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <main className={styles.container}>
      {/* ログインテキストを囲むrelative親要素 */}
      <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
        <h1 className={styles.title}>ログイン</h1>
      
      <div
          onClick={handleHiddenClick}
          className={styles.hiddenButton}
          aria-hidden="true"
        />
      </div>

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

