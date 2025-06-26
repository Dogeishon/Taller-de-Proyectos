import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

export default function useImproveModel() {
  const [model, setModel] = useState(null);
  useEffect(() => {
    tf.loadLayersModel("/model/model.json").then(setModel);
  }, []);
  return model;  // null mientras carga
}