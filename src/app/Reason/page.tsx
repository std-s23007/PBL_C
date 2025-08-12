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
  where,
  getDocs,
  doc,
  deleteField,
  query,
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

  // 欠席理由登録・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim() || !date.trim()) return;

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid),
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("この日付の欠席記録がありません。先にカレンダーで欠席登録をしてください。");
      return;
    }

    const docToUpdate = querySnapshot.docs[0];
    await updateDoc(doc(db, "reviews", docToUpdate.id), {
      comment: comment,
    });

    alert("欠席理由を登録しました。");
    router.push("/Calendar");
  };

  // 理由(comment)フィールドのみ削除
  const handleDelete = async (id?: string) => {
    if (!id) return;
    await updateDoc(doc(db, "reviews", id), {
      comment: deleteField(),
    });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, comment: undefined } : r))
    );
    alert("欠席理由を削除しました。");
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <h1 className={styles.title}>欠席理由</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              日付
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment" className={styles.label}>
              欠席理由
            </label>
            <textarea
              id="comment"
              placeholder="欠席理由を入力してください"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.primaryButton}>
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
          {reviews.filter((r) => r.comment && r.comment.trim() !== "").length === 0 ? (
            <p className={styles.noReviews}>まだ投稿がありません。</p>
          ) : (
            <div className={styles.reviewList}>
              {reviews
                .filter((r) => r.comment && r.comment.trim() !== "")
                .map((r) => (
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
