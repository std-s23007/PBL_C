"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 半角英数字のみ許可する関数
  const handleAlphaNumChange = (setter) => (e) => {
    const value = e.target.value;
    // 半角英数字のみ許可
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setter(value);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const adminUser = "s23400";
    const adminPass = "Itcollege";

    if (username === adminUser && password === adminPass) {
      router.push("/Admin");
    } else {
      setError("ユーザー名かパスワードが間違っています");
    }
  };

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>管理者ログイン</h1>
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="ユーザー名（半角英数字）"
            value={username}
            onChange={handleAlphaNumChange(setUsername)}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            placeholder="パスワード（半角英数字）"
            value={password}
            onChange={handleAlphaNumChange(setPassword)}
            className={styles.input}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>ログイン</button>
          <button
            type="button"
            className={styles.button}
            style={{ backgroundColor: "#888" }}
            onClick={() => router.push("/")}
          >
            キャンセル
          </button>
        </div>
      </form>
      {error && <p style={{ color: "red", marginTop: "16px", textAlign: "center" }}>{error}</p>}
    </div>
  );
}
