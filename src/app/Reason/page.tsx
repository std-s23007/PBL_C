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
  orderBy, // 日付順にソートするために追加
} from "firebase/firestore";
// アイコンをインポート
import { FiCalendar, FiMessageSquare, FiSend, FiTrash2 } from "react-icons/fi";

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
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中の状態を追加
  const router = useRouter();

  // ユーザー認証の確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
      // 認証状態が確定したらローディングを解除
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Firestore からログインユーザーの投稿を取得
  useEffect(() => {
    if (!user) return;

    async function fetchReviews() {
      // 日付の降順で取得するようにクエリを変更
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid),
        orderBy("date", "desc") 
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
    if (!user || !comment || !date || isSubmitting) return;

    setIsSubmitting(true); // 送信開始
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        comment,
        date,
        userId: user.uid,
      });
      // 新しい投稿をリストの先頭に追加
      setReviews([{ id: docRef.id, comment, date, userId: user.uid }, ...reviews]);
      setComment("");
      setDate("");
      // 登録成功後にカレンダーページへ遷移
      router.push("/Calendar");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("登録に失敗しました。");
    } finally {
      setIsSubmitting(false); // 送信終了
    }
  };

  // 投稿を削除
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    // 削除前に確認ダイアログを表示
    if (window.confirm("この投稿を本当に削除しますか？")) {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  // 日付のフォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingSpinner}></div>
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>欠席理由の登録</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              <FiCalendar />
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
              <FiMessageSquare />
              欠席理由
            </label>
            <textarea
              id="comment"
              placeholder="例: 体調不良のため"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.textarea}
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => router.push("/Calendar")}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
              disabled={!comment || !date || isSubmitting}
            >
              <FiSend />
              {isSubmitting ? "登録中..." : "登録"}
            </button>
          </div>
        </form>
      </div>

      <div className={`${styles.card} ${styles.reviewSection}`}>
        <h2 className={styles.reviewTitle}>あなたの投稿一覧</h2>
        {reviews.length > 0 ? (
          <ul className={styles.reviewList}>
            {reviews.map((r) => (
              <li key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewContent}>
                  <p className={styles.reviewDate}>{formatDate(r.date)}</p>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(r.id)}
                  aria-label="削除"
                >
                  <FiTrash2 />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noReviewsText}>まだ投稿はありません。</p>
        )}
      </div>
    </main>
  );
}