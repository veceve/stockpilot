"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Target = {
  id: number;
  symbol: string;
  buy_price: number | null;
  sell_price: number | null;
};

type QuoteMap = Record<
  string,
  {
    price: number;
  }
>;

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [quotes, setQuotes] = useState<QuoteMap>({});

  const [symbol, setSymbol] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  // 📦 加载目标价
  async function loadTargets() {
    const { data, error } = await supabase
      .from("price_targets")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setTargets(data || []);
  }

  // 📊 获取实时价格（复用 dashboard API）
  async function loadQuotes() {
    const res = await fetch("/api/dashboard");
    const data = await res.json();

    const map: QuoteMap = {};

    data.list.forEach((item: any) => {
      map[item.symbol] = {
        price: item.price,
      };
    });

    setQuotes(map);
  }

  // 💾 保存目标价
  async function saveTarget() {
    if (!symbol) return;

    const { error } = await supabase
      .from("price_targets")
      .upsert({
        symbol: symbol.toUpperCase(),
        buy_price: buyPrice ? Number(buyPrice) : null,
        sell_price: sellPrice ? Number(sellPrice) : null,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setBuyPrice("");
    setSellPrice("");

    loadTargets();
  }

  // 🗑 删除目标
  async function deleteTarget(id: number) {
    const { error } = await supabase
      .from("price_targets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadTargets();
  }

  useEffect(() => {
    loadTargets();
    loadQuotes();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-4 text-gray-900">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        🎯 价格目标提醒
      </h1>

      {/* 导航 */}
      <Navbar />

      {/* 输入区 */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="flex flex-wrap gap-2 items-center">

          {/* 股票 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="股票代码 (如 NVDA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />

          {/* 买入价 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="买入价"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
          />

          {/* 卖出价 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="卖出价"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />

          <button
            onClick={saveTarget}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            保存目标
          </button>

        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-4 border-b">
          <h2 className="font-bold">
            📊 目标价格监控
          </h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">股票</th>
              <th className="p-3">当前价</th>
              <th className="p-3">买入价</th>
              <th className="p-3">卖出价</th>
              <th className="p-3">信号</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {targets.map((t) => {
              const quote = quotes[t.symbol];
              const price = quote?.price || 0;

              let signal = "📊 观望";
              let color = "text-gray-800";

              if (t.buy_price && price <= t.buy_price) {
                signal = "📉 可买入";
                color = "text-green-600";
              }

              if (t.sell_price && price >= t.sell_price) {
                signal = "📈 可卖出";
                color = "text-red-600";
              }

              return (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">
                    {t.symbol}
                  </td>

                  <td className="p-3">
                    ${price.toFixed(2)}
                  </td>

                  <td className="p-3">
                    {t.buy_price ?? "-"}
                  </td>

                  <td className="p-3">
                    {t.sell_price ?? "-"}
                  </td>

                  <td className={`p-3 font-semibold ${color}`}>
                    {signal}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => deleteTarget(t.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>

      </div>
    </main>
  );
}