"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import styles from "./page.module.css";

export default function AttendanceCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [absentDays, setAbsentDays] = useState(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/");
    });

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

  useEffect(() => {
    const loadAbsentDays = async () => {
      if (user && year !== null && month !== null) {
        const docRef = doc(db, "attendance", user.uid);
        const docSnap = await getDoc(docRef);
        const key = `${year}-${String(month + 1).padStart(2, "0")}`;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data[key]) setAbsentDays(new Set(data[key]));
          else setAbsentDays(new Set());
        }
      }
    };
    loadAbsentDays();
  }, [user, year, month]);

  const saveAbsentDays = async () => {
    if (user && year !== null && month !== null) {
      const docRef = doc(db, "attendance", user.uid);
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      const docSnap = await getDoc(docRef);
      const oldData = docSnap.exists() ? docSnap.data() : {};
      await setDoc(docRef, {
        ...oldData,
        [key]: Array.from(absentDays),
      });
      alert("欠席日が保存されました！");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const changeMonth = (offset) => {
    if (year === null || month === null) return;
    const newDate = new Date(year, month + offset);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();
    router.push(`?year=${newYear}&month=${newMonth + 1}`);
  };

  if (!user || year === null || month === null) return <div>読み込み中...</div>;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  const weekdays = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, month, day).getDay();
    if (dow !== 0 && dow !== 6) weekdays.push(day);
  }

  const toggleAbsent = (day) => {
    const dow = new Date(year, month, day).getDay();
    if (dow === 0 || dow === 6) return;
    const newSet = new Set(absentDays);
    if (newSet.has(day)) newSet.delete(day);
    else newSet.add(day);
    setAbsentDays(newSet);
  };

  const resetAbsentDays = () => setAbsentDays(new Set());

  const validAbsentDays = Array.from(absentDays).filter((day) => {
    const dow = new Date(year, month, day).getDay();
    return dow !== 0 && dow !== 6;
  });

  const attendanceRate =
    weekdays.length > 0
      ? ((weekdays.length - validAbsentDays.length) / weekdays.length) * 100
      : 100;

  const calendarCells = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div><strong>ログイン中:</strong> {user.email}</div>
        <button className={`${styles.buttonBase} ${styles.logoutButton}`} onClick={handleLogout}>ログアウト</button>
      </header>

      <div className={styles.monthSwitch}>
        <button
          className={`${styles.buttonBase} ${styles.monthSwitchButton}`}
          onClick={() => changeMonth(-1)}
        >
          前の月 ←
        </button>
        <h2 className={styles.monthTitle}>{year}年 {month + 1}月 出席カレンダー</h2>
        <button
          className={`${styles.buttonBase} ${styles.monthSwitchButton}`}
          onClick={() => changeMonth(1)}
        >
          次の月 →
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>日</th>
            <th className={styles.tableHeader}>月</th>
            <th className={styles.tableHeader}>火</th>
            <th className={styles.tableHeader}>水</th>
            <th className={styles.tableHeader}>木</th>
            <th className={styles.tableHeader}>金</th>
            <th className={styles.tableHeader}>土</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, idx) => {
                if (!day) return <td key={idx}></td>;
                const dow = new Date(year, month, day).getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isAbsent = absentDays.has(day);
                return (
                  <td
                    key={idx}
                    onClick={() => !isWeekend && toggleAbsent(day)}
                    className={`${styles.dayCell} ${isAbsent ? styles.absent : ""} ${isWeekend ? styles.weekend : ""}`}
                    title={isAbsent ? "欠席" : isWeekend ? "土日" : "出席"}
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

      <div className={styles.absentList}>
        欠席日一覧:{" "}
        {validAbsentDays.length > 0
          ? validAbsentDays.sort((a, b) => a - b).join(", ")
          : "なし"}
      </div>

      <div className={styles.buttonRow}>
        <button className={`${styles.buttonBase} ${styles.resetButton}`} onClick={resetAbsentDays}>リセット</button>
        <button className={`${styles.buttonBase} ${styles.reasonButton}`} onClick={saveAbsentDays}>保存</button>
        <button className={`${styles.buttonBase} ${styles.reasonButton}`} onClick={() => router.push("/Reason")}>欠席理由</button>
      </div>
    </div>
  );
}
