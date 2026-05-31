"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Target = {
  id: number;
  symbol: string;
  buy_price: number | null;
  sell_price: number | null;
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);

  const [symbol, setSymbol] = useState("");
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");

  // 📥 加载目标价列表
  async function loadTargets() {
    const { data, error } = await supabase
      .from("price_targets")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setTargets(data);
    }
  }

  // ➕ 新增 / 更新目标价（同 symbol 覆盖）
  async function saveTarget() {
    if (!symbol) return;

    const { error } = await supabase
      .from("price_targets")
      .upsert({
        symbol: symbol.toUpperCase(),
        buy_price: buy ? Number(buy) : null,
        sell_price: sell ? Number(sell) : null,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setBuy("");
    setSell("");

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
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <h1>🎯 目标价管理</h1>

      <hr />

      {/* ➕ 输入区域 */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="股票代码（如 NVDA）"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="买入价"
          value={buy}
          onChange={(e) => setBuy(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="卖出价"
          value={sell}
          onChange={(e) => setSell(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={saveTarget}>
          保存
        </button>
      </div>

      <hr />

      {/* 📋 列表 */}
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>股票</th>
            <th>买入目标</th>
            <th>卖出目标</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {targets.map((t) => (
            <tr key={t.id}>
              <td>{t.symbol}</td>

              <td>
                {t.buy_price ?? "-"}
              </td>

              <td>
                {t.sell_price ?? "-"}
              </td>

              <td>
                <button
                  onClick={() =>
                    deleteTarget(t.id)
                  }
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}