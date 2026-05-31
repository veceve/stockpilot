"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-6">

      {/* 标题 */}
      <h1 className="text-2xl font-bold mb-4">
        📊 StockPilot Control Center
      </h1>

      <Navbar />

      {!data ? (
        <p className="text-gray-500">加载中...</p>
      ) : (
        <>
          {/* 总览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">总资产</p>
              <p className="text-xl font-bold">
                ${Number(data.totalValue || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">持仓数</p>
              <p className="text-xl font-bold">
                {data.list?.length || 0}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">状态</p>
              <p className="text-xl font-bold text-blue-600">
                运行中
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">风险</p>
              <p className="text-xl font-bold text-green-600">
                已监控
              </p>
            </div>

          </div>

          {/* 持仓表 */}
          <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="p-4 border-b">
              <h2 className="font-bold">
                📦 持仓监控
              </h2>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">股票</th>
                  <th className="p-3">股数</th>
                  <th className="p-3">成本</th>
                  <th className="p-3">现价</th>
                  <th className="p-3">收益</th>
                  <th className="p-3">状态</th>
                </tr>
              </thead>

              <tbody>
                {data.list?.map((i: any) => {
                  const profit = Number(i.profitPercent || 0);
                  const isProfit = profit >= 0;

                  // 状态颜色优化（保留你的 status）
                  let statusColor = "text-gray-600";

                  if (profit > 5) statusColor = "text-green-600";
                  if (profit < -5) statusColor = "text-red-600";

                  return (
                    <tr
                      key={i.symbol}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">
                        {i.symbol}
                      </td>

                      <td className="p-3">
                        {i.shares}
                      </td>

                      <td className="p-3">
                        ${Number(i.avgCost || 0).toFixed(2)}
                      </td>

                      <td className="p-3">
                        ${Number(i.price || 0).toFixed(2)}
                      </td>

                      {/* ✅ 收益红绿修复 */}
                      <td
                        className={`p-3 font-semibold ${
                          isProfit
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {profit.toFixed(2)}%
                      </td>

                      {/* 状态动态颜色（不丢你原字段） */}
                      <td className={`p-3 ${statusColor}`}>
                        {i.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        </>
      )}
    </main>
  );
}