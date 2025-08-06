"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "./page.module.css";

export default function AttendanceCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ログインユーザー情報
  const [user, setUser] = useState(null);

  // カレンダーの年月・欠席日管理
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [absentDays, setAbsentDays] = useState(new Set());
  // Firestore用
  const [loadingAbsent, setLoadingAbsent] = useState(false);

  // 認証状態監視＋年月取得
  useEffect(() => {
    // Firebase Auth ユーザー監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
    });

    // URLクエリから年月取得
    const y = parseInt(searchParams.get("year") || "");
    const m = parseInt(searchParams.get("month") || "");
    if (!isNaN(y) && !isNaN(m)) {
      setYear(y);
      setMonth(m - 1);
    } else {
      const today = new Date();
      setYear(today.getFullYear());
      setMonth(today.getMonth());
    }

    return () => unsubscribe();
  }, [router, searchParams]);

  // Firestoreから欠席日取得
  useEffect(() => {
    async function fetchAbsentDays() {
      if (!user || year === null || month === null) return;
      setLoadingAbsent(true);
      const monthStr = (month + 1).toString().padStart(2, "0");
      const yearStr = year.toString();
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const days = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // date: "2025-08-06" の形式を想定
        if (data.date && data.date.startsWith(`${yearStr}-${monthStr}`)) {
          const day = parseInt(data.date.split("-")[2]);
          if (!isNaN(day)) days.add(day);
        }
      });
      setAbsentDays(days);
      setLoadingAbsent(false);
    }
    fetchAbsentDays();
  }, [user, year, month]);

  // ログアウト関数
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user || year === null || month === null) return <div>読み込み中...</div>;
  if (loadingAbsent) return <div>欠席情報を取得中...</div>;

  // 出席率計算・カレンダー描画は元コード通り
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  const weekdays = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) weekdays.push(day);
  }

  const toggleAbsent = (day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    const newSet = new Set(absentDays);
    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }
    setAbsentDays(newSet);
  };

  const resetAbsentDays = () => setAbsentDays(new Set());

  const validAbsentDays = Array.from(absentDays).filter((day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  });

  const attendanceRate = ((weekdays.length - validAbsentDays.length) / weekdays.length) * 100;

  const calendarCells = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);

  const weeks = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(calendarCells.slice(i * 7, i * 7 + 7));
  }

  return (
    <div className={styles.container}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <strong>ログイン中:</strong> {user.email}
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          ログアウト
        </button>
      </header>

      <h2>{month + 1}月 出席記録</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, idx) => {
                if (!day) return <td key={idx}></td>;

                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                const isAbsent = absentDays.has(day);
                const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

                return (
                  <td
                    key={idx}
                    onClick={() => !isWeekend && toggleAbsent(day)}
                    className={styles.dayCell}
                    style={{
                      backgroundColor: isAbsent ? '#f88' : isWeekend ? '#eee' : '#cfc',
                      cursor: isWeekend ? 'default' : 'pointer'
                    }}
                    title={isAbsent ? '欠席' : isWeekend ? '土日' : '出席'}
                  >
                    {day}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.rate}>
        出席率: {attendanceRate.toFixed(1)}%
      </div>

      <button className={styles.resetButton} onClick={resetAbsentDays}>
        リセット
      </button>

      <button className={styles.reasonButton} onClick={() => router.push("/Reason")}>
        欠席理由
      </button>
    </div>
  );
}
