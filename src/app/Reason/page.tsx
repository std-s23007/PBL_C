"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {collection, updateDoc, where, getDocs, doc, deleteField} from "firebase/firestore";
import { query } from "firebase/firestore";

type Review = {
  id?: string;
  comment?: string;
  date: string;
  userId: string;
};
export default function Reason() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState<string | undefined>(undefined);
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

   // 投稿を Firestore に「追加」ではなく「更新」するロジックに変更
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment || !comment.trim() || !date.trim()) return;

    // 1. 更新対象のドキュメントを検索
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid),
      where("date", "==", date) // ユーザーIDと日付で検索
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // 2. 対応するデータが存在しない場合
      alert(
        "この日付の欠席記録がありません。\n先にカレンダーページで欠席登録をしてください。"
      );
      return; // 処理を中断
    } else {
      // 3. 対応するデータが存在する場合、そのデータを更新する
      const docToUpdate = querySnapshot.docs[0]; // 該当する最初のドキュメントを取得
      await updateDoc(doc(db, "reviews", docToUpdate.id), {
        comment: comment, // commentフィールドを追加・上書き
      });
      alert("欠席理由を登録しました。");
      router.push("/Calendar"); // カレンダーページに戻る
    }
  };

  // 投稿の「ドキュメント」ではなく「理由(comment)フィールド」を削除するように変更
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;

    // 1. Firestoreのドキュメントへの参照を取得
    const docRef = doc(db, "reviews", id);

    // 2. updateDoc を使い、commentフィールドだけを削除する
    await updateDoc(docRef, {
      comment: deleteField(),
    });

    // 3. 画面に即時反映させるため、ローカルのstateからも理由を削除
    setReviews(reviews.filter((r) => r.id !== id));

    alert("欠席理由を削除しました。");
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
          required
        />
        <textarea
          placeholder="欠席理由"
          value={comment ?? ""}
          onChange={(e) => setComment(e.target.value)}
          className={styles.formGroup}
          required
        />
        <button
        type="submit"
        className={styles.button}
        >
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
        {reviews
        .filter((r) => r.comment && r.comment.trim() !== "")
        .map((r) => (
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