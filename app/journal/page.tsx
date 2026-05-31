"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Journal = {
  id: number;
  symbol: string;
  action_type: string;
  content: string;
};

export default function JournalPage() {
  const [logs, setLogs] = useState<Journal[]>([]);

  const [symbol, setSymbol] = useState("");
  const [content, setContent] = useState("");

  async function loadLogs() {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("id", { ascending: false });

    if (data) setLogs(data);
  }

  async function addLog() {
    if (!symbol || !content) return;

    await supabase.from("journal_entries").insert({
      symbol: symbol.toUpperCase(),
      action_type: "NOTE",
      content,
    });

    setSymbol("");
    setContent("");

    loadLogs();
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <h1>📝 投资日志</h1>

      <hr />

      <h2>新增记录</h2>

      <input
        placeholder="股票代码"
        value={symbol}
        onChange={(e) =>
          setSymbol(e.target.value)
        }
      />

      <br />

      <textarea
        placeholder="写下你的投资逻辑..."
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        rows={5}
        style={{ width: 300, marginTop: 10 }}
      />

      <br />

      <button
        onClick={addLog}
        style={{ marginTop: 10 }}
      >
        保存日志
      </button>

      <hr />

      <h2>历史记录</h2>

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <b>{log.symbol}</b>

          <p>{log.content}</p>
        </div>
      ))}
    </main>
  );
}