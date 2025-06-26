import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

/**
 * Devuelve una función que registra 👍/👎 en la colección pdf_feedback.
 */
export default function usePdfFeedback() {
  return async function sendFeedback({
    pdfId,
    topic,
    difficulty,
    styleMatch,
    timeSpent,
    wasUseful,
  }) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await addDoc(collection(db, "pdf_feedback"), {
      uid,
      pdf_id: pdfId,
      topic,
      difficulty,
      style_match: styleMatch ? 1 : 0,
      time_spent: timeSpent,          // segundos
      was_useful: wasUseful,          // true / false
      created_at: serverTimestamp(),
    });
  };
}
