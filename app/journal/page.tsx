"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type JournalEntry = {
  id: number;
  symbol: string;
  action_type: "BUY" | "SELL" | "NOTE" | "MISTAKE";
  content: string | null;
  created_at: string;
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const [symbol, setSymbol] = useState("");
  const [actionType, setActionType] =
    useState<JournalEntry["action_type"]>("NOTE");
  const [content, setContent] = useState("");

  // 📦 加载日志
  async function loadEntries() {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEntries(data || []);
  }

  // 💾 保存日志
  async function saveEntry() {
    if (!symbol || !actionType) return;

    const { error } = await supabase
      .from("journal_entries")
      .insert({
        symbol: symbol.toUpperCase(),
        action_type: actionType,
        content: content || null,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setContent("");
    setActionType("NOTE");

    loadEntries();
  }

  // 🗑 删除
  async function deleteEntry(id: number) {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadEntries();
  }

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-6">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        🧠 投资复盘日志
      </h1>

      {/* 导航 */}
      <Navbar />

      {/* 输入区 */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="flex flex-wrap gap-2 items-center">

          {/* 股票 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="股票代码（如 NVDA）"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />

          {/* 类型 */}
          <select
            className="border rounded px-3 py-2"
            value={actionType}
            onChange={(e) =>
              setActionType(
                e.target.value as JournalEntry["action_type"]
              )
            }
          >
            <option value="BUY">📈 买入理由</option>
            <option value="SELL">📉 卖出理由</option>
            <option value="MISTAKE">⚠ 错误复盘</option>
            <option value="NOTE">📝 普通记录</option>
          </select>

          {/* 内容 */}
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="写下你的思考 / 复盘 / 决策逻辑..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 保存 */}
          <button
            onClick={saveEntry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            保存
          </button>

        </div>
      </div>

      {/* 列表 */}
      <div className="space-y-4">

        {entries.map((e) => {
          const typeStyle =
            e.action_type === "BUY"
              ? "bg-green-100 text-green-700"
              : e.action_type === "SELL"
              ? "bg-red-100 text-red-700"
              : e.action_type === "MISTAKE"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-700";

          return (
            <div
              key={e.id}
              className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >

              {/* 顶部 */}
              <div className="flex justify-between items-center mb-2">

                <div className="flex gap-2 items-center">

                  <span className="text-sm font-bold">
                    {e.symbol}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${typeStyle}`}
                  >
                    {e.action_type}
                  </span>

                </div>

                <button
                  onClick={() => deleteEntry(e.id)}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  删除
                </button>

              </div>

              {/* 内容 */}
              <div className="text-gray-800 whitespace-pre-wrap">
                {e.content}
              </div>

              {/* 时间 */}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(e.created_at).toLocaleString()}
              </div>

            </div>
          );
        })}

      </div>
    </main>
  );
}