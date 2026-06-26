"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Halo! Ada yang bisa saya bantu tentang kalkulus (limit, turunan, integral) atau grafik fungsi?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Muat pesan dari cookie saat pertama kali render
  useEffect(() => {
    const adminId = pb.authStore.model?.id || "";
    const cookieKey = adminId ? `admin_chat_history_${adminId}` : "admin_chat_history";
    const savedMessages = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieKey}=`))
      ?.split("=")[1];

    if (savedMessages) {
      try {
        const parsed = JSON.parse(decodeURIComponent(savedMessages));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Gagal memuat riwayat chat:", e);
      }
    }
  }, []);

  // Simpan ke cookie setiap kali messages berubah
  useEffect(() => {
    const adminId = pb.authStore.model?.id || "";
    const cookieKey = adminId ? `admin_chat_history_${adminId}` : "admin_chat_history";
    const historyToSave = messages.slice(-15);
    document.cookie = `${cookieKey}=${encodeURIComponent(JSON.stringify(historyToSave))}; path=/; max-age=86400`;

    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // send full recent conversation so the upstream model can use context
      const payload = { messages: messages.concat(userMsg) };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      // If Gemini-like response, extract the assistant text
      let assistantText = "";
      if (data) {
        // Gemini response shape: { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
        if (Array.isArray(data.candidates) && data.candidates[0]?.content?.parts?.[0]?.text) {
          assistantText = data.candidates[0].content.parts[0].text.trim();
        } else if (data.markdown) {
          assistantText = data.markdown;
        } else if (data.message) {
          assistantText = data.message;
        } else if (typeof data === "string") {
          assistantText = data;
        } else {
          // fallback: try to find nested text
          assistantText = JSON.stringify(data);
        }
      } else {
        assistantText = "Terjadi kesalahan membaca respon server.";
      }

      const botMsg = { id: Date.now() + 1, role: "assistant", content: assistantText };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const errMsg = { id: Date.now() + 2, role: "assistant", content: "Terjadi kesalahan menghubungi server." };
      setMessages((m) => [...m, errMsg]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* <div className={styles.card}> */}
          <div className={styles.sectionHeader}>
            <h2>Tanyakan Pertanyaan Kamu Disini</h2>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.chatWindow}>
              <div className={styles.messages}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.message} ${m.role === "user" ? styles.messageUser : styles.messageAssistant}`}
                  >
                    <div className={styles.messageContent}>{m.content}</div>
                  </div>
                ))}{/* Thinking indicator */}
                {loading && (
                  <div className={`${styles.message} ${styles.messageAssistant}`}>
                    <div className={styles.thinkingDots}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            <div className={styles.inputRow}>
              <textarea
                className={styles.textarea}
                placeholder="Tanyakan sesuatu..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
              />
              <Button  onClick={sendMessage} disabled={loading}>
                {loading ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}
