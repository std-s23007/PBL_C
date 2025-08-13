"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./page.module.css";

export default function AdminPage() {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [reviewsData, setReviewsData] = useState({});
  const [loading, setLoading] = useState(true);

  // 出席データ、ユーザープロフィール、レビューをリアルタイム取得
  useEffect(() => {
    setLoading(true);

    const unsubscribeAttendance = onSnapshot(collection(db, "attendance"), (attendanceSnap) => {
      const attendance = {};
      attendanceSnap.forEach((doc) => {
        attendance[doc.id] = doc.data();
      });
      setAttendanceData(attendance);
      setLoading(false);
    });

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (usersSnap) => {
      const profiles = {};
      usersSnap.forEach((doc) => {
        const data = doc.data();
        profiles[doc.id] = data.email || "メール不明";
      });
      setUserProfiles(profiles);
    });

    const unsubscribeReviews = onSnapshot(collection(db, "reviews"), (reviewsSnap) => {
      const reviewsByUser = {};
      reviewsSnap.forEach((doc) => {
        const data = doc.data();
        const uid = data.userId;
        if (!reviewsByUser[uid]) {
          reviewsByUser[uid] = [];
        }
        reviewsByUser[uid].push({
          id: doc.id,
          ...data,
        });
      });
      setReviewsData(reviewsByUser);
    });

    return () => {
      unsubscribeAttendance();
      unsubscribeUsers();
      unsubscribeReviews();
    };
  }, []);

  // 月の表示フォーマット
  const formatMonthKey = (key) => {
    const [year, month] = key.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  if (loading) return <div>データ読み込み中...</div>;

  return (
    <div className={styles.container}>
      <h1>出席状況</h1>
      <button className={styles.button} onClick={() => router.push("/")}>
        ログイン画面に戻る
      </button>

      {Object.keys(attendanceData).length === 0 && <p>出席データがありません</p>}

      {Object.entries(attendanceData).map(([uid, months]) => (
        <div key={uid} className={styles.userSection}>
          <h2>メール: {userProfiles[uid] || "不明なユーザー"}</h2>
          {Object.keys(months).length === 0 && <p>データなし</p>}
          <ul>
            {Object.entries(months).map(([monthKey, absentDays]) => (
              <li key={monthKey}>
                <strong>{formatMonthKey(monthKey)}：</strong>
                {absentDays.length > 0 ? absentDays.join(", ") : "欠席なし"}
              </li>
            ))}
          </ul>

          {/* レビュー表示 */}
          <h3>欠席理由</h3>
          {!reviewsData[uid] && <p>レビューなし</p>}
          {reviewsData[uid] && (
            <ul>
              {reviewsData[uid].map((review) => (
                <li key={review.id}>
                  <strong>{userProfiles[review.userId] || "名無し"}</strong>：{review.comment} <br />
                  <small>{review.date}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
