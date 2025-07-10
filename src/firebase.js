import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDug6k408E81owFyQNA98YjikBAqGlE7mM",
  authDomain: "pbl-c-54088.firebaseapp.com",
  projectId: "pbl-c-54088",
  storageBucket: "pbl-c-54088.firebasestorage.app",
  messagingSenderId: "44768519903",
  appId: "1:44768519903:web:6b8a002e5981bb1300ab6a",
  measurementId: "G-D8B3QJG0G9"
};
// Firebaseの初期化

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// データ追加
async function addStudent(studentId, name, password) {
  try {
    const docRef = await addDoc(collection(db, "students"), {
      学籍番号: studentId,
      氏名: name,
      パスワード: password
    });
    console.log("ドキュメント追加成功 ID: ", docRef.id);
  } catch (e) {
    console.error("追加エラー: ", e);
  }
}

// データ取得
async function getStudent() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
}

addStudent();
getStudent();
