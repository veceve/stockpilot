"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

      {/* 导航 */}
      <div className="mb-6 space-x-2 text-sm">
        <Link href="/" className="text-blue-600">Dashboard</Link>
        <Link href="/plans" className="text-blue-600">仓位</Link>
        <Link href="/targets" className="text-blue-600">目标价</Link>
        <Link href="/journal" className="text-blue-600">日志</Link>
      </div>

      {!data ? (
        <p>加载中...</p>
      ) : (
        <>
          {/* 总览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">总资产</p>
              <p className="text-xl font-bold">
                ${data.totalValue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">持仓数</p>
              <p className="text-xl font-bold">
                {data.list.length}
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
                {data.list.map((i: any) => (
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
                      ${i.avgCost.toFixed(2)}
                    </td>
                    <td className="p-3">
                      ${i.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-green-600">
                      {i.profitPercent.toFixed(2)}%
                    </td>
                    <td className="p-3">
                      {i.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </>
      )}
    </main>
  );
}