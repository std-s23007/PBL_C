"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./page.module.css";

export default function AdminPage() {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [reviewsData, setReviewsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let attendanceLoaded = false;
    let usersLoaded = false;
    let reviewsLoaded = false;

    const unsubscribeAttendance = onSnapshot(collection(db, "attendance"), (snap) => {
      const data = {};
      snap.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setAttendanceData(data);
      attendanceLoaded = true;
      if (attendanceLoaded && usersLoaded && reviewsLoaded) setLoading(false);
    });

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snap) => {
      const profiles = {};
      snap.forEach((doc) => {
        const data = doc.data();
        profiles[doc.id] = data.displayName || "名無し"; // displayNameを使用
      });
      setUserProfiles(profiles);
      usersLoaded = true;
      if (attendanceLoaded && usersLoaded && reviewsLoaded) setLoading(false);
    });

    const unsubscribeReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      const reviewsByUser = {};
      snap.forEach((doc) => {
        const data = doc.data();
        const uid = data.userId;
        if (!reviewsByUser[uid]) reviewsByUser[uid] = [];
        reviewsByUser[uid].push({
          id: doc.id,
          comment: data.comment,
          date: data.date,
        });
      });
      setReviewsData(reviewsByUser);
      reviewsLoaded = true;
      if (attendanceLoaded && usersLoaded && reviewsLoaded) setLoading(false);
    });

    return () => {
      unsubscribeAttendance();
      unsubscribeUsers();
      unsubscribeReviews();
    };
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>出席状況（管理者用）</h1>
      <button className={styles.button} onClick={() => router.push("/")}>
        ログイン画面に戻る
      </button>

      {Object.keys(userProfiles).map((uid) => {
        const name = userProfiles[uid];
        const attendance = attendanceData[uid] || {};
        const absentDays = Object.values(attendance).flat();
        const userReviews = reviewsData[uid] || [];

        return (
          <div key={uid} className={styles.userSection}>
            <h2 className={styles.userSectionTitle}>{name}</h2>

            {absentDays.length > 0 && <div>{absentDays.join(", ")}</div>}

            {userReviews.length > 0 ? (
              <ul className={styles.list}>
                {userReviews.map((review) => (
                  <li key={review.id} className={styles.listItem}>
                    {review.date}：{review.comment}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.message}>レビューなし</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
