"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Review = {
  id: number;
  comment: string;
  date: string;
};

export default function ReasonPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const newReview: Review = {
        id: Date.now(),
        comment,
        date: new Date().toLocaleString(),
      };
      setReviews([newReview, ...reviews]);
      setComment("");
      setLoading(false);
    }, 500);
  };

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>欠席理由</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>コメント</label>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
              disabled={loading}
            >
              投稿
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => router.back()}
            >
              キャンセル
            </button>
          </div>
        </form>
        <div className={styles.reviewSection}>
          <h2 className={styles.reviewTitle}>投稿一覧</h2>
          {loading ? (
            <div className={styles.loadingSpinner}></div>
          ) : reviews.length === 0 ? (
            <p className={styles.noReviewsText}>まだ投稿がありません</p>
          ) : (
            <ul className={styles.reviewList}>
              {reviews.map((r) => (
                <li key={r.id} className={styles.reviewItem}>
                  <div className={styles.reviewContent}>
                    <div className={styles.reviewDate}>{r.date}</div>
                    <div className={styles.reviewComment}>{r.comment}</div>
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(r.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
