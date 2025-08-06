"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import styles from "./page.module.css";

// アイコンコンポーネント (SVG)
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default function AttendanceCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null); // 0-indexed (0 = 1月)
  const [absentDays, setAbsentDays] = useState(new Set());

  // 認証状態の監視と初期の年月設定
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
    });

    const y = parseInt(searchParams.get("year") || "", 10);
    const m = parseInt(searchParams.get("month") || "", 10);

    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      setYear(y);
      setMonth(m - 1);
    } else {
      const today = new Date();
      setYear(today.getFullYear());
      setMonth(today.getMonth());
    }

    return () => unsubscribe();
  }, [router, searchParams]);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  // 年月ナビゲーション
  const navigateToMonth = (y, m) => {
    router.push(`/your-calendar-path?year=${y}&month=${m + 1}`);
  };

  const handlePrevMonth = () => {
    if (year === null || month === null) return;
    const newDate = new Date(year, month - 1);
    navigateToMonth(newDate.getFullYear(), newDate.getMonth());
  };

  const handleNextMonth = () => {
    if (year === null || month === null) return;
    const newDate = new Date(year, month + 1);
    navigateToMonth(newDate.getFullYear(), newDate.getMonth());
  };

  // ローディング表示
  if (!user || year === null || month === null) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  // カレンダーデータ生成
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  // 営業日数（土日を除く）
  const weekdays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayOfWeek = new Date(year, month, day).getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 ? day : null;
  }).filter(Boolean);

  // 欠席日のトグル
  const toggleAbsent = (day) => {
    const newSet = new Set(absentDays);
    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }
    setAbsentDays(newSet);
  };

  const resetAbsentDays = () => setAbsentDays(new Set());

  // 営業日のみの欠席日数
  const validAbsentDaysCount = Array.from(absentDays).filter(day => weekdays.includes(day)).length;

  // 出席率の計算
  const attendanceRate = weekdays.length > 0
    ? ((weekdays.length - validAbsentDaysCount) / weekdays.length) * 100
    : 100;

  // カレンダーのセルを生成
  const calendarCells = Array(firstDayWeekday).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const weeks = [];
  while (calendarCells.length > 0) {
    weeks.push(calendarCells.splice(0, 7));
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.userInfo}>
          {user.email}
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          ログアウト
        </button>
      </header>

      <main className={styles.card}>
        <div className={styles.calendarHeader}>
          <button onClick={handlePrevMonth} className={styles.navButton} aria-label="前の月へ">
            <ChevronLeft />
          </button>
          <h2 className={styles.calendarTitle}>{year}年 {month + 1}月</h2>
          <button onClick={handleNextMonth} className={styles.navButton} aria-label="次の月へ">
            <ChevronRight />
          </button>
        </div>

        <table className={styles.calendarTable}>
          <thead>
            <tr>
              {['日', '月', '火', '水', '木', '金', '土'].map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, idx) => {
                  if (!day) return <td key={idx} className={styles.emptyCell}></td>;

                  const date = new Date(year, month, day);
                  const dayOfWeek = date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isAbsent = absentDays.has(day);

                  let cellClass = styles.dayCell;
                  if (isWeekend) cellClass += ` ${styles.weekend}`;
                  if (isAbsent && !isWeekend) cellClass += ` ${styles.absent}`;

                  return (
                    <td key={idx}>
                      <div
                        onClick={() => !isWeekend && toggleAbsent(day)}
                        className={cellClass}
                      >
                        {day}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <footer className={styles.calendarFooter}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span>営業日数</span>
              <strong>{weekdays.length}日</strong>
            </div>
            <div className={styles.statItem}>
              <span>欠席日数</span>
              <strong>{validAbsentDaysCount}日</strong>
            </div>
            <div className={styles.statItem}>
              <span>出席率</span>
              <strong className={styles.attendanceRate}>{attendanceRate.toFixed(1)}%</strong>
            </div>
          </div>
          <div className={styles.actions}>
            {/* 今月へボタンは削除済み */}
            <button className={styles.secondaryButton} onClick={resetAbsentDays}>リセット</button>
            <button className={styles.primaryButton} onClick={() => router.push("/Reason")}>
              欠席理由入力
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
