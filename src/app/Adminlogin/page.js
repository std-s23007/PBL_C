
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SimpleLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "s23400" && password === "Itcollege") {
      localStorage.setItem("isAdmin", "true"); // 認証情報を保存
      router.push("/Admin"); // 管理者ページへ移動
    } else {
      setError("ユーザー名かパスワードが違います");
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>管理者ログイン</h1>

      <form onSubmit={handleSubmit} className={styles.formGroup}>
        <label>ユーザー名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />

        <label>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
    </main>
  );
}
