// components/Reason.tsx
"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  updateDoc,
  addDoc,
  where,
  getDocs,
  doc,
  query,
  deleteDoc
} from "firebase/firestore";

type Review = {
  id?: string;
  comment?: string;
  date: string;
  userId: string;
};

export default function Reason() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザー認証チェック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Firestoreからログインユーザーの投稿取得
  useEffect(() => {
    async function fetchReviews() {
      if (!user) return;

      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const userReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }));
      setReviews(userReviews);
    }
    fetchReviews();
  }, [user]);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim() || !date.trim()) return;

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid),
      where("date", "==", date)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // 既存データを更新
      const docRef = doc(db, "reviews", querySnapshot.docs[0].id);
      await updateDoc(docRef, { comment: comment });
    } else {
      // 新規データを追加
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        date,
        comment,
      });
    }

    // 更新後に再取得
    if (!user) return;
    const updatedSnapshot = await getDocs(
      query(collection(db, "reviews"), where("userId", "==", user.uid))
    );
    const updatedReviews = updatedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Review, "id">),
    }));
    setReviews(updatedReviews);

    setComment("");
    setDate("");
  };

  // 投稿削除
  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "reviews", id));
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>理由入力</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.formGroup}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="理由を入力"
          className={styles.formGroup}
        />
        <button type="submit" className={styles.button}>送信</button>
        <button type="button" className={styles.cancelbutton} onClick={() => router.push("/")}>
          戻る
        </button>
      </form>

      <div className={styles.reviewSection}>
        <h2 className={styles.reviewTitle}>あなたの投稿</h2>
        {reviews.map((r) => (
          <div className={styles.reviewItem} key={r.id}>
            <div>
              <div className={styles.reviewDate}>{r.date}</div>
              <div>{r.comment}</div>
            </div>
            <button
              className={styles.deletebutton}
              onClick={() => handleDelete(r.id)}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
