// components/Reason.tsx
"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

import { collection, updateDoc, where, getDocs, doc, deleteField, query } from "firebase/firestore";

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

      const querySnapshot = await getDocs(q);
      const userReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }));
      setReviews(userReviews);
    }
    fetchReviews();
  }, [user]);


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

    }

  );
}
