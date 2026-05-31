"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Plan = {
  id: number;
  symbol: string;
  target_shares: number | null;
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

  // 加载仓位目标
  async function loadPlans() {
    const { data, error } = await supabase
      .from("position_plans")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    if (data) setPlans(data);
  }

  // 加载当前持仓（trades聚合）
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

  // 保存仓位目标
  async function savePlan() {
    if (!symbol) return;

    const { error } = await supabase
      .from("position_plans")
      .upsert({
        symbol: symbol.toUpperCase(),
        target_shares: targetShares ? Number(targetShares) : null,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setTargetShares("");
    loadPlans();
  }

  // 删除仓位目标
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
      <h1 className="text-2xl font-bold mb-4">⚖️ 仓位管理</h1>

      {/* 输入区域 */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <input
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="股票代码 (如 NVDA)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="目标股数"
          value={targetShares}
          onChange={(e) => setTargetShares(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          onClick={savePlan}
        >
          保存
        </button>
      </div>

      {/* 仓位列表 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">📋 仓位目标列表</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">股票</th>
              <th className="p-3">目标股数</th>
              <th className="p-3">当前持仓</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((plan) => {
              const holding = holdings[plan.symbol];
              const currentShares = holding ? holding.shares : 0;
              const targetSharesNum = plan.target_shares || 0;
              const diff = currentShares - targetSharesNum;

              let status = "正常";
              let colorClass = "text-gray-600";

              if (diff < 0) {
                status = `低配 ${-diff}股`;
                colorClass = "text-green-600";
              } else if (diff > 0) {
                status = `超配 ${diff}股`;
                colorClass = "text-red-600";
              }

              return (
                <tr
                  key={plan.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{plan.symbol}</td>
                  <td className="p-3">{targetSharesNum}</td>
                  <td className="p-3">{currentShares}</td>
                  <td className={`p-3 font-semibold ${colorClass}`}>
                    {status}
                  </td>
                  <td className="p-3">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => deletePlan(plan.id)}
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