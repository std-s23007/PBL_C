"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && comment) {
      setReviews([...reviews, { name, comment }]);
      setName("");
      setComment("");
    }
  };
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1>欠席理由</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="コメント"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          className={styles.myButton}
        >
          送信
        </button>
      </form>
      <div className="mt-6">
        <h5>投稿一覧</h5>
        {reviews.map((r, index) => (
          <div key={index} className="border-b py-2">
            <p className="font-bold">{r.name}</p>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </main>
  );
}