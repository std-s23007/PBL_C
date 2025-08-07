"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { Suspense } from "react";
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

  // 欠席日をreviewsコレクションから取得
  useEffect(() => {
    async function fetchAbsentDays() {
      if (!user || year === null || month === null) return;
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
        if (data.date && data.date.startsWith(`${yearStr}-${monthStr}`)) {
          const day = parseInt(data.date.split("-")[2]);
          if (!isNaN(day)) days.add(day);
        }
      });
      setAbsentDays(days);
    }
    fetchAbsentDays();
  }, [user, year, month]);

  // ログアウト関数
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user || year === null || month === null) return <div>読み込み中...</div>;

  // 出席率計算・カレンダー描画は元コード通り
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  const weekdays = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) weekdays.push(day);
  }

  // 欠席日を追加・削除
  const toggleAbsent = async (day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;
    const monthStr = (month + 1).toString().padStart(2, "0");
    const yearStr = year.toString();
    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`;
    if (absentDays.has(day)) {
      // reviewsから該当日データ削除
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid),
        where("date", "==", dateStr)
      );
      const querySnapshot = await getDocs(q);
      await Promise.all(querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
      const newSet = new Set(absentDays);
      newSet.delete(day);
      setAbsentDays(newSet);
    } else {
      // reviewsに新規追加
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        date: dateStr
      });
      const newSet = new Set(absentDays);
      newSet.add(day);
      setAbsentDays(newSet);
    }
  };

  // 欠席日リセット
  const resetAbsentDays = async () => {
    if (!user || year === null || month === null) {
      setAbsentDays(new Set());
      return;
    }
    const monthStr = (month + 1).toString().padStart(2, "0");
    const yearStr = year.toString();
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    const batchDeletes = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.date && data.date.startsWith(`${yearStr}-${monthStr}`)) {
        batchDeletes.push(deleteDoc(docSnap.ref));
      }
    });
    await Promise.all(batchDeletes);
    setAbsentDays(new Set());
  };

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
    <Suspense fallback={<div>読み込み中...</div>}>
    <div className={styles.container}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <strong>ログイン中:</strong> {user.email}
        </div>
        <button className={`${styles.buttonBase} ${styles.logoutButton}`} onClick={handleLogout}>
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

      <button className={`${styles.buttonBase} ${styles.resetButton}`} onClick={resetAbsentDays}>
        リセット
      </button>

      <button className={`${styles.buttonBase} ${styles.reasonButton}`} onClick={() => router.push("/Reason")}>
        欠席理由
      </button>
    </div>
    </Suspense>
  );
}
