"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Plan = {
  id: number;
  symbol: string;
  target_shares: number;
};

type Holding = {
  symbol: string;
  shares: number;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});

  const [symbol, setSymbol] = useState("");
  const [targetShares, setTargetShares] = useState("");

  // 📦 加载目标仓位
  async function loadPlans() {
    const { data, error } = await supabase
      .from("position_plans")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPlans(data || []);
  }

  // 📊 从 trades 计算当前持仓
  async function loadHoldings() {
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const map: Record<string, Holding> = {};

    trades?.forEach((t) => {
      if (!map[t.symbol]) {
        map[t.symbol] = { symbol: t.symbol, shares: 0 };
      }

      if (t.trade_type === "BUY") {
        map[t.symbol].shares += Number(t.shares);
      } else if (t.trade_type === "SELL") {
        map[t.symbol].shares -= Number(t.shares);
      }
    });

    setHoldings(map);
  }

  // 💾 保存目标仓位
  async function savePlan() {
    if (!symbol || !targetShares) return;

    const { error } = await supabase
      .from("position_plans")
      .upsert({
        symbol: symbol.toUpperCase(),
        target_shares: Number(targetShares),
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setTargetShares("");

    loadPlans();
  }

  // 🗑 删除目标
  async function deletePlan(id: number) {
    const { error } = await supabase
      .from("position_plans")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadPlans();
  }

  useEffect(() => {
    loadPlans();
    loadHoldings();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-6">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        ⚖️ 仓位管理（股数目标）
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

          {/* 目标股数 */}
          <input
            className="border rounded px-3 py-2"
            placeholder="目标股数"
            value={targetShares}
            onChange={(e) =>
              setTargetShares(e.target.value)
            }
          />

          {/* 保存 */}
          <button
            onClick={savePlan}
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
            📋 仓位目标对比
          </h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">股票</th>
              <th className="p-3">目标股数</th>
              <th className="p-3">当前持仓</th>
              <th className="p-3">差值</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((p) => {
              const holding = holdings[p.symbol];
              const current = holding ? holding.shares : 0;
              const target = p.target_shares;
              const diff = current - target;

              let status = "正常";
              let color = "text-gray-600";

              if (diff < 0) {
                status = `⬇ 低配 ${Math.abs(diff)}股`;
                color = "text-green-600";
              } else if (diff > 0) {
                status = `⚠ 超配 ${diff}股`;
                color = "text-red-600";
              }

              return (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">
                    {p.symbol}
                  </td>

                  <td className="p-3">
                    {target}
                  </td>

                  <td className="p-3">
                    {current}
                  </td>

                  <td className="p-3">
                    {diff}
                  </td>

                  <td className={`p-3 font-semibold ${color}`}>
                    {status}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => deletePlan(p.id)}
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