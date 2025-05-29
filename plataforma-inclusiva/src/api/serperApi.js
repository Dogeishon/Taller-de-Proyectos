// src/api/serperApi.js
export const serperSearch = async (query) => {
  const apiKey = import.meta.env.VITE_SERPER_API_KEY;

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({ q: query }),
  });

  const data = await response.json();

  if (!data.organic || data.organic.length === 0) {
    return [];
  }

  // Solo retornamos los 3 primeros resultados relevantes
  return data.organic.slice(0, 3).map((item) => ({
    title: item.title,
    link: item.link,
  }));
};
