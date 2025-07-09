'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';  // ここでCSSモジュールをimport

export default function AttendanceCalendar() {
  const router = useRouter();
  const daysInMonth = 31; // 1〜31日
  const [absentDays, setAbsentDays] = useState(new Set());

  // 日付クリックで欠席日をToggle
  const toggleAbsent = (day) => {
    const newSet = new Set(absentDays);
    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }
    setAbsentDays(newSet);
  };

  const resetAbsentDays = () => {
    setAbsentDays(new Set());
  };

  const attendanceRate = ((daysInMonth - absentDays.size) / daysInMonth) * 100;

  return (
    <div className={styles.container}>
      <h2>○月 出席記録</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th><th>日</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, weekIndex) => (
            <tr key={weekIndex}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = weekIndex * 7 + dayIndex + 1;
                if (day > daysInMonth) return <td key={dayIndex}></td>;

                const isAbsent = absentDays.has(day);

                return (
                  <td
                    key={dayIndex}
                    onClick={() => toggleAbsent(day)}
                    className={styles.dayCell}
                    style={{ backgroundColor: isAbsent ? '#f88' : '#cfc' }}
                    title={isAbsent ? '欠席' : '出席'}
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

      <button
        className={styles.backButton}
        onClick={() => {
          alert('ログイン画面へ戻ります');
          router.push('/');
        }}
      >
        戻る
      </button>
     <button className={styles.resetButton} onClick={resetAbsentDays}>
        リセット
      </button>
    </div>
  );;
};
