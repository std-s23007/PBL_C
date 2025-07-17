// app/page.tsx
"use client";
import styles from "./page.module.css"
import { useState } from "react";
import { useRouter } from 'next/navigation';
type Review = {
  name: string;
  comment: string;
};
export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && comment) {
      setReviews([...reviews, { name, comment }]);
      setName("");
      setComment("");
    }
  };
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">欠席理由</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="日付"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="欠席理由"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className={styles.button}
        >
          登録
        </button>
        <button
          className={styles.cancelbutton}
          onClick={() => router.push('../Calender')}
        >
          キャンセル
        </button>
      </form>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">投稿一覧</h2>
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