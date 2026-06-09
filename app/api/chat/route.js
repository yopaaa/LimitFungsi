import { NextResponse } from "next/server";
import axios from "axios";

const USER_API_URL = process.env.USER_API_URL || process.env.GEMINI_ENDPOINT;
const USER_API_KEY = process.env.USER_API_KEY || process.env.GEMINI_API || process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT;
const GEMINI_API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY;

export const GET = () => {
  return NextResponse.json({ message: "Chat API proxy is up" });
};

export async function POST(req) {
  try {
    const body = await req.json();

    if (!USER_API_URL) {
      return NextResponse.json({ error: "USER_API_URL is not configured" }, { status: 500 });
    }

    // If using Gemini endpoint, build request similar to extract-answer
    if (GEMINI_ENDPOINT && USER_API_URL === GEMINI_ENDPOINT) {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
      }

      // Support simple { prompt: string } or passthrough body
      const prompt = typeof body === "object" && body.prompt ? body.prompt : JSON.stringify(body);

      const requestPayload = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      };

      const upstream = await axios.post(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, requestPayload, {
        headers: { "Content-Type": "application/json" }
      });

      return NextResponse.json(upstream.data, { status: upstream.status });
    }

    // Fallback: forward to USER_API_URL with optional Bearer auth
    const headers = { "Content-Type": "application/json" };
    if (USER_API_KEY) headers["Authorization"] = `Bearer ${USER_API_KEY}`;

    const upstream = await axios.post(USER_API_URL, body, { headers });

    return NextResponse.json(upstream.data, { status: upstream.status });
  } catch (error) {
    console.error("/api/chat error:", error.response?.data || error.message);
    const message = error.response?.data || { error: error.message || "Unknown error" };
    return NextResponse.json(message, { status: error.response?.status || 500 });
  }
}
