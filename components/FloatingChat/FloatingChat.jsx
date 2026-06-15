"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./FloatingChat.module.css";
import { LuMessageCircle, LuX, LuSend, LuLogIn } from "react-icons/lu";
import { pb } from "@/utils/db";
import Link from "next/link";

export default function FloatingChat({ materialContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Halo! Saya Limit Bot. Ada yang ingin ditanyakan seputar materi ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Cek status login saat komponen di-mount
    setIsLoggedIn(pb.authStore.isValid);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isLoggedIn) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          materialContext: materialContext
        }),
      });

      const data = await response.json();
      
      let assistantText = "";
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        assistantText = data.candidates[0].content.parts[0].text;
      } else {
        assistantText = data.message || "Maaf, saya sedang tidak bisa menjawab.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan koneksi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div 
        className={styles.floatingButton} 
        onClick={() => setIsOpen(!isOpen)}
        title="Tanya AI tentang materi ini"
      >
        {isOpen ? <LuX /> : <LuMessageCircle />}
      </div>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>Limit Bot Helper</h3>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <LuX />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}
              >
                {msg.content}
              </div>
            ))}
            
            {!isLoggedIn && (
              <div className={`${styles.message} ${styles.botMessage}`} style={{ backgroundColor: '#ffecd2', borderColor: '#ff9800' }}>
                Ups! Kamu harus login dulu untuk bisa bertanya ke AI dan berdiskusi lebih lanjut.
              </div>
            )}

            {isLoading && <div className={styles.loading}>Sedang berpikir...</div>}
            <div ref={messagesEndRef} />
          </div>

          {isLoggedIn ? (
            <div className={styles.inputArea}>
              <textarea
                className={styles.input}
                placeholder="Tanya sesuatu..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={isLoading}>
                <LuSend />
              </button>
            </div>
          ) : (
            <div className={styles.inputArea}>
              <Link href="/auth/login" style={{ width: '100%' }}>
                <button className={styles.sendBtn} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <LuLogIn /> Login untuk Bertanya
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
