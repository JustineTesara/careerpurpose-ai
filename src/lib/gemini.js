// src/lib/gemini.js
// Using Groq API for free AI inference

const GROQ_URL = `https://api.groq.com/openai/v1/chat/completions`; // ✅ Fix 1: correct Groq URL

const cache = {};

export async function callGemini(prompt, cacheKey = null) {
  if (cacheKey && cache[cacheKey]) {
    return cache[cacheKey];
  }

  // ✅ Fix 2: use correct localStorage key "cp_gemini_key"
  const key = localStorage.getItem("cp_gemini_key") || "";

  if (!key) {
    return "⚠️ Please paste your Groq API key in the sidebar. Get it free at console.groq.com";
  }

  try {
    const response = await fetch(GROQ_URL, {
      // ✅ Fix 3: was using undefined GROQ_URL variable
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return `❌ API Error: ${data.error.message}`;
    }

    const result = data.choices?.[0]?.message?.content || "No response.";

    if (cacheKey) cache[cacheKey] = result;

    return result;
  } catch (error) {
    return "❌ Network error. Check your connection.";
  }
}
