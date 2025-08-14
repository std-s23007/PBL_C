"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import styles from "./page.module.css";

export default function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [absentDays, setAbsentDays] = useState([]);
  const [user, setUser] = useState(null);

  // 認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        loadAbsentData(u.uid, year, month);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [year, month]);

  // Firestoreから欠席データを読み込み
  const loadAbsentData = async (uid, y, m) => {
    const docRef = doc(db, "attendance", `${uid}_${y}_${m + 1}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setAbsentDays(docSnap.data().days || []);
    } else {
      setAbsentDays([]);
    }
  };

  // Firestoreに保存
  const saveAbsentData = async () => {
    if (!user) return;
    const docRef = doc(db, "attendance", `${user.uid}_${year}_${month + 1}`);
    await setDoc(docRef, { days: absentDays });
    alert("保存しました！");
  };

  // 欠席日リセット
  const resetAbsentData = () => {
    setAbsentDays([]);
  };

  // 月の日数
  const daysInMonth = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // 日付クリックで欠席日をトグル
  const toggleAbsent = (day) => {
    setAbsentDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // 出席率計算
  const attendanceRate = () => {
    const total = daysInMonth(year, month);
    const absent = absentDays.length;
    return Math.round(((total - absent) / total) * 100);
  };

  // 前の月へ
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  // 次の月へ
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const totalDays = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();

  let calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<td key={`empty-${i}`} className={styles.weekend}></td>);
  }
  for (let day = 1; day <= totalDays; day++) {
    const isWeekend =
      new Date(year, month, day).getDay() === 0 ||
      new Date(year, month, day).getDay() === 6;
    const isAbsent = absentDays.includes(day);
    calendarCells.push(
      <td
        key={day}
        className={`${styles.dayCell} ${styles.dayCellHover} ${
          isAbsent ? styles.absent : ""
        } ${isWeekend ? styles.weekend : ""}`}
        onClick={() => {
          if (!isWeekend) toggleAbsent(day);
        }}
      >
        {day}
      </td>
    );
  }

  const rows = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    rows.push(<tr key={i}>{calendarCells.slice(i, i + 7)}</tr>);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>{user ? `${user.displayName} さん` : "未ログイン"}</span>
        {user && (
          <button
            className={styles.logoutButton}
            onClick={() => signOut(auth)}
          >
            ログアウト
          </button>
        )}
      </div>

      {/* 月移動ボタン追加 */}
      <div className={styles.monthSwitch}>
        <button className={styles.monthSwitchButton} onClick={prevMonth}>
          前の月
        </button>
        <span className={styles.monthTitle}>
          {year}年 {month + 1}月
        </span>
        <button className={styles.monthSwitchButton} onClick={nextMonth}>
          次の月
        </button>
      </div>

      <div className={styles.rate}>出席率: {attendanceRate()}%</div>

      <table className={styles.table}>
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th key={day} className={styles.tableHeader}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>

      <div className={styles.absentList}>
        欠席日: {absentDays.length > 0 ? absentDays.join(", ") : "なし"}
      </div>

      <div className={styles.buttonRow}>
        <button
          className={`${styles.buttonBase} ${styles.resetButton}`}
          onClick={resetAbsentData}
        >
          リセット
        </button>
        <button
          className={`${styles.buttonBase} ${styles.saveButton}`}
          onClick={saveAbsentData}
        >
          保存
        </button>
         <button className={`${styles.buttonBase} ${styles.reasonButton}`} onClick={() => router.push("/Reason")}>
          欠席理由
        </button>
      </div>
    </div>
  );
}
