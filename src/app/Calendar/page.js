"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./page.module.css"; // 新しいCSSモジュールをインポート
export default function AttendanceCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [absentDays, setAbsentDays] = useState(new Set());
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
    });
    const y = parseInt(searchParams.get("year") || "");
    const m = parseInt(searchParams.get("month") || "");
    if (!isNaN(y) && !isNaN(m)) {
      setYear(y);
      setMonth(m - 1);
    }
    // ここで欠席データをフェッチするロジックを想定
    // fetchAbsentData(year, month);
    return () => unsubscribe();
  }, [router, searchParams, year, month]);
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  if (!user) return <div className={styles.loading}>読み込み中...</div>;
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

      // reviewsに新規追加
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        date: dateStr
      });
      const newSet = new Set(absentDays);
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
  const attendanceRate = weekdays.length > 0 ? ((weekdays.length - validAbsentDays.length) / weekdays.length) * 100 : 100;
  const calendarCells = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);
  const weeks = [];
  for (let i = 0; i < Math.ceil(calendarCells.length / 7); i++) {
    weeks.push(calendarCells.slice(i * 7, i * 7 + 7));
  }
  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.userInfo}>
            <p>ログイン中:</p>
            <strong>{user.email}</strong>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </header>
        <main className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <h2>{year}年 {month + 1}月</h2>
          </div>
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
                    const isToday = new Date().toDateString() === date.toDateString();
                    let cellClassName = styles.dayCell;
                    if (isWeekend) cellClassName += ` ${styles.weekend}`;
                    if (isAbsent) cellClassName += ` ${styles.absent}`;
                    if (isToday) cellClassName += ` ${styles.today}`;
                    if (!isWeekend) cellClassName += ` ${styles.weekday}`;
                    return (
                      <td
                        key={idx}
                        onClick={() => !isWeekend && toggleAbsent(day)}
                        className={cellClassName}
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
          <div className={styles.summary}>
            <div className={styles.rate}>
              出席率: <strong>{attendanceRate.toFixed(1)}%</strong>
            </div>
             <div className={styles.legend}>
              <span className={`${styles.legendItem} ${styles.present}`}></span> 出席
              <span className={`${styles.legendItem} ${styles.absentLegend}`}></span> 欠席
            </div>
          </div>
          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.resetButton}`} onClick={resetAbsentDays}>
              リセット
            </button>
            <button className={`${styles.button} ${styles.reasonButton}`} onClick={() => router.push("/Reason")}>
              欠席理由
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}