import * as tf from "@tensorflow/tfjs";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useImproveModel from "./useImproveModel";

export default function useImproveDecision() {
  const model = useImproveModel();
  return async function decide() {
    if (!model) return null;
    const uid = auth.currentUser.uid;
    const snap = await getDoc(doc(db,"usuarios",uid));
    const u = snap.data();

    const tensor = tf.tensor2d([[
      u.num_logins           || 0,
      u.num_interactions     || 0,
      u.num_content_requests || 0,
      u.nivelDiscapacidad    || 1
    ]]);
    const prob = model.predict(tensor).dataSync()[0];

    // guardar para evidencia runtime
    await updateDoc(doc(db,"usuarios",uid), { probWillImprove: prob });
    return prob;
  };
}
