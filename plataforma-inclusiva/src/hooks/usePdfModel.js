import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

// one-hot según la lista dinámica de topics
function oneHot(topic, topicList) {
  const vec = Array(topicList.length).fill(0);
  const idx = topicList.indexOf(topic);
  if (idx >= 0) vec[idx] = 1;
  return vec;
}

export default function usePdfModel() {
  const [model, setModel] = useState(null);
  const [meta,  setMeta ] = useState(null);   // {mean, std, topics}

  useEffect(() => {
    tf.loadLayersModel("/model_pdf/model.json").then(setModel);
    fetch("/pdf_meta.json").then(r => r.json()).then(setMeta);
  }, []);

  function predictProb({ difficulty, styleMatch, timeSpent, topic }) {
    if (!model || !meta) return null;
    const { mean, std, topics } = meta;

    const num = [
      (difficulty           - mean[0]) / std[0],
      ((styleMatch ? 1 : 0) - mean[1]) / std[1],
      (timeSpent            - mean[2]) / std[2],
    ];

    const input = tf.tensor2d([[...num, ...oneHot(topic, topics)]]);
    return model.predict(input).dataSync()[0];
  }

  useEffect(() => {
  if (model) console.log("✅ Modelo PDF cargado");
}, [model]);

useEffect(() => {
  if (meta) console.log("✅ Meta cargada:", meta.topics.length, "topics");
}, [meta]);

  return { model, predictProb };
}

