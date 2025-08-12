// components/Reason.tsx
"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Review = {
  id?: string;
  comment: string;
  date: string;
  userId: string;
};

export default function Reason() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ユーザー認証の確認
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

  // Firestore からログインユーザーの投稿を取得
  useEffect(() => {
    if (!user) return;

    async function fetchReviews() {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user?.uid)
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

  // 投稿を Firestore に追加
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (comment && date) {
      const docRef = await addDoc(collection(db, "reviews"), {
        comment,
        date,
        userId: user.uid,
      });
      setReviews([...reviews, { id: docRef.id, comment, date, userId: user.uid }]);
      setComment("");
      setDate("");
    }
  };

  // 投稿を削除
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    await deleteDoc(doc(db, "reviews", id));
    setReviews(reviews.filter((r) => r.id !== id));
  };

  if (loading) return <div className={styles.loading}>読み込み中...</div>;

  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <h1 className={styles.title}>欠席理由</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>日付</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="comment" className={styles.label}>欠席理由</label>
            <textarea
              id="comment"
              placeholder="欠席理由を入力してください"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.primaryButton}
              onClick={() => router.push("/Calendar")}
            >
              登録
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.push("/Calendar")}
            >
              キャンセル
            </button>
          </div>
        </form>

        <section className={styles.reviewSection}>
          <h2 className={styles.reviewTitle}>あなたの投稿一覧</h2>
          {reviews.length === 0 ? (
            <p className={styles.noReviews}>まだ投稿がありません。</p>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewContent}>
                    <p className={styles.reviewDate}>{r.date}</p>
                    <p className={styles.reviewComment}>{r.comment}</p>
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(r.id)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}