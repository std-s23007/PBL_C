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
        router.push("/login");
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

  if (loading) return <div>読み込み中...</div>;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>欠席理由</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.formGroup}
        />
        <textarea
          placeholder="欠席理由"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={styles.formGroup}
        />
        <button type="submit" className={styles.button}>
          登録
        </button>
        <button
          type="button"
          className={styles.cancelbutton}
          onClick={() => router.push("/Calendar")}
        >
          キャンセル
        </button>
      </form>

      <div className={styles.reviewSection}>
        <h2 className={styles.reviewTitle}>あなたの投稿一覧</h2>
        {reviews.map((r) => (
          <div key={r.id} className={styles.reviewItem}>
            <div>
              <p className={styles.reviewDate}>{r.date}</p>
              <p>{r.comment}</p>
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
    </main>
  );
}