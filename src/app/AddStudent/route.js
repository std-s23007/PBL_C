import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";  // Firebase初期化ファイルを用意しておく
import { collection, addDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const data = await request.json();
    const docRef = await addDoc(collection(db, "students"), {
      学籍番号: data.studentId,
      氏名: data.name,
      パスワード: data.password,
    });
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
