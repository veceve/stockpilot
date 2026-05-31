"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Holding = {
  symbol: string;
  shares: number;
  cost: number;
  avgCost: number;
  price: number;
  marketValue: number;
  profitPercent: number;
};

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHoldings() {
    setLoading(true);

    const res = await fetch("/api/dashboard");
    const data = await res.json();

    setHoldings(data.list || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHoldings();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-6">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        📦 持仓管理
      </h1>

      {/* 导航 */}
      <Navbar />

      {/* 内容 */}
      {loading ? (
        <p className="text-gray-700">
          加载中...
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* 表头 */}
          <div className="p-4 border-b">
            <h2 className="font-bold">
              当前持仓
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">股票</th>
                <th className="p-3">股数</th>
                <th className="p-3">成本价</th>
                <th className="p-3">现价</th>
                <th className="p-3">市值</th>
                <th className="p-3">盈亏</th>
                <th className="p-3">状态</th>
              </tr>
            </thead>

            <tbody>
              {holdings.map((h) => (
                <tr
                  key={h.symbol}
                  className="border-t hover:bg-gray-50"
                >
                  {/* 股票 */}
                  <td className="p-3 font-medium">
                    {h.symbol}
                  </td>

                  {/* 股数 */}
                  <td className="p-3">
                    {h.shares}
                  </td>

                  {/* 成本 */}
                  <td className="p-3">
                    ${h.avgCost.toFixed(2)}
                  </td>

                  {/* 现价 */}
                  <td className="p-3">
                    ${h.price.toFixed(2)}
                  </td>

                  {/* 市值 */}
                  <td className="p-3">
                    ${h.marketValue.toFixed(2)}
                  </td>

                  {/* 盈亏 */}
                  <td
                    className={`p-3 font-semibold ${
                      h.profitPercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {h.profitPercent.toFixed(2)}%
                  </td>

                  {/* 状态 */}
                  <td className="p-3">
                    {h.profitPercent > 10 ? (
                      <span className="text-green-600">
                        📈 强势盈利
                      </span>
                    ) : h.profitPercent < -10 ? (
                      <span className="text-red-600">
                        📉 风险较大
                      </span>
                    ) : (
                      <span className="text-gray-800">
                        ⚖ 正常波动
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </main>
  );
}