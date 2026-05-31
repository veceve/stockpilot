"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Trade = {
  id: number;
  symbol: string;
  trade_type: "BUY" | "SELL";
  shares: number;
  price: number;
  trade_date: string;
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");

  // 📦 加载交易记录
  async function loadTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setTrades(data || []);
  }

  // 💾 保存交易
  async function saveTrade() {
    if (!symbol || !shares || !price) return;

    setLoading(true);

    const { error } = await supabase.from("trades").insert({
      symbol: symbol.toUpperCase(),
      trade_type: tradeType,
      shares: Number(shares),
      price: Number(price),
      trade_date: new Date().toISOString().split("T")[0],
    });

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setShares("");
    setPrice("");

    loadTrades();
  }

  // 🗑 删除交易
  async function deleteTrade(id: number) {
    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadTrades();
  }

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-4 text-gray-900">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        💹 交易中心
      </h1>

      {/* 导航 */}
      <Navbar />

      {/* 输入区域 */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="flex flex-wrap gap-2 items-center">

          {/* 股票 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="股票代码 (如 NVDA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />

          {/* 类型 */}
          <select
            className="border rounded px-3 py-2"
            value={tradeType}
            onChange={(e) =>
              setTradeType(e.target.value as "BUY" | "SELL")
            }
          >
            <option value="BUY">买入</option>
            <option value="SELL">卖出</option>
          </select>

          {/* 股数 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="股数"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />

          {/* 价格 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="价格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          {/* 按钮 */}
          <button
            onClick={saveTrade}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存交易"}
          </button>

        </div>
      </div>

      {/* 交易列表 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-4 border-b">
          <h2 className="font-bold">
            📋 交易记录
          </h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">日期</th>
              <th className="p-3">股票</th>
              <th className="p-3">类型</th>
              <th className="p-3">股数</th>
              <th className="p-3">价格</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {trades.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">
                  {t.trade_date}
                </td>

                <td className="p-3 font-medium">
                  {t.symbol}
                </td>

                <td className="p-3">
                  {t.trade_type === "BUY" ? (
                    <span className="text-green-600">
                      BUY
                    </span>
                  ) : (
                    <span className="text-red-600">
                      SELL
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {t.shares}
                </td>

                <td className="p-3">
                  ${t.price}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => deleteTrade(t.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </main>
  );
}