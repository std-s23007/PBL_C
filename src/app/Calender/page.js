'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function AttendanceCalendar() {

  const daysInMonth = 31;
  const [absentDays, setAbsentDays] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState(null);
  const [reasons, setReasons] = useState(new Map());
  const [reasonInput, setReasonInput] = useState('');
  const [isReasonFormVisible, setIsReasonFormVisible] = useState(false);

const toggleAbsent = (number) => {
  const newSet = new Set(absentDays);
  if (newSet.has(number)) {
    newSet.delete(number);
    setSelectedDay(null);
    setIsReasonFormVisible(false);
  } else {
    newSet.add(number);
    setSelectedDay(number);
  }
  setAbsentDays(newSet);
};

  const resetAbsentDays = () => {
    setAbsentDays(new Set());
    setSelectedDay(null);
    setReasonInput('');
    setIsReasonFormVisible(false);
    setReasons(new Map());
  };

  const saveReason = () => {
    if (selectedDay !== null) {
      const newMap = new Map(reasons);
      newMap.set(selectedDay, reasonInput);
      setReasons(newMap);
      alert(`${selectedDay}日の理由を登録しました: ${reasonInput}`);
      console.log(`【${selectedDay}日】の欠席理由: ${reasonInput}`);
      setReasonInput('');
      setIsReasonFormVisible(false);
    }
  };

  const attendanceRate = ((daysInMonth - absentDays.size) / daysInMonth) * 100;

  return (
    <div className={styles.container}>
      <h2>10月 出席記録</h2>

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
                const reason = reasons.get(day);

                return (
                  <td
                    key={dayIndex}
                    onClick={() => toggleAbsent(day)}
                    className={styles.dayCell}
                    style={{ backgroundColor: isAbsent ? '#f88' : '#cfc' }}
                    title={isAbsent ? `欠席\n${reason || '理由未入力'}` : '出席'}
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

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          className={styles.backButton}
        >
          戻る
        </button>

        <button className={styles.resetButton} onClick={resetAbsentDays}>
          リセット
        </button>

        {selectedDay !== null && (
          <>
            <button className={styles.reasonButton} onClick={() => setIsReasonFormVisible(true)}>
              欠席理由を入力
            </button>

            {isReasonFormVisible && (
              <div className={styles.reasonForm}>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder={`${selectedDay}日の理由を入力`}
                  className={styles.reasonInput}
                />
                <button onClick={saveReason} className={styles.saveButton}>
                  保存
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

