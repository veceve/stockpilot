"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Trade = {
  id: number;
  symbol: string;
  trade_type: string;
  shares: number;
  price: number;
};

type Position = {
  symbol: string;
  shares: number;
  avgCost: number;
  
  currentPrice?: number;
  marketValue?: number;
  profit?: number;
  profitPercent?: number;
};

export default function HoldingsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  
  async function loadQuotes(
  positionsData: Position[]
) {
  const updated =
    await Promise.all(
      positionsData.map(
        async (position) => {
          const quote =
            await fetch(
              `/api/quote?symbol=${position.symbol}`
            );

          const data =
            await quote.json();

          const currentPrice =
            Number(data.c);

          const marketValue =
            currentPrice *
            position.shares;

          const costValue =
            position.avgCost *
            position.shares;

          const profit =
            marketValue -
            costValue;

          const profitPercent =
            (profit /
              costValue) *
            100;

          return {
            ...position,
            currentPrice,
            marketValue,
            profit,
            profitPercent,
          };
        }
      )
    );

  setPositions(updated);
}
  async function loadTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setTrades(data);
      calculatePositions(data);
    }
  }

  function calculatePositions(data: Trade[]) {
    const map: Record<
      string,
      {
        shares: number;
        totalCost: number;
      }
    > = {};

    data.forEach((trade) => {
      if (!map[trade.symbol]) {
        map[trade.symbol] = {
          shares: 0,
          totalCost: 0,
        };
      }

      if (trade.trade_type === "BUY") {
        map[trade.symbol].shares += Number(
          trade.shares
        );

        map[trade.symbol].totalCost +=
          Number(trade.shares) *
          Number(trade.price);
      }
    });

    const result: Position[] =
      Object.entries(map).map(
        ([symbol, value]) => ({
          symbol,
          shares: value.shares,
          avgCost:
            value.totalCost /
            value.shares,
        })
      );

    loadQuotes(result);
  }

  async function addTrade() {
    if (!symbol || !shares || !price)
      return;

    const { error } = await supabase
      .from("trades")
      .insert({
        symbol: symbol.toUpperCase(),
        trade_type: "BUY",
        shares: Number(shares),
        price: Number(price),
        trade_date:
          new Date()
            .toISOString()
            .split("T")[0],
      });

    if (error) {
      console.error(error);
      return;
    }

    setSymbol("");
    setShares("");
    setPrice("");

    loadTrades();
  }

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <h1>💰 持仓管理</h1>

      <hr />

      <h2>新增买入记录</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          placeholder="股票代码"
          value={symbol}
          onChange={(e) =>
            setSymbol(e.target.value)
          }
        />

        <input
          placeholder="数量"
          value={shares}
          onChange={(e) =>
            setShares(e.target.value)
          }
        />

        <input
          placeholder="价格"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
        />

        <button onClick={addTrade}>
          买入
        </button>
      </div>

      <hr />

      <h2>📊 当前持仓</h2>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          marginBottom: "30px",
        }}
      >
        <thead>
          <tr>
            <th>股票</th>
<th>持仓</th>
<th>成本</th>
<th>现价</th>
<th>市值</th>
<th>浮盈亏</th>
<th>收益率</th>
          </tr>
        </thead>

        <tbody>
          {positions.map(
            (position) => (
              <tr
                key={position.symbol}
              >
                <td>{position.symbol}</td>

<td>{position.shares}</td>

<td>
  $
  {position.avgCost.toFixed(2)}
</td>

<td>
  $
  {position.currentPrice?.toFixed(
    2
  ) ?? "-"}
</td>

<td>
  $
  {position.marketValue?.toFixed(
    2
  ) ?? "-"}
</td>

<td>
  $
  {position.profit?.toFixed(
    2
  ) ?? "-"}
</td>

<td>
  {position.profitPercent?.toFixed(
    2
  ) ?? "-"}
  %
</td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <h2>📜 交易记录</h2>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>股票</th>
            <th>类型</th>
            <th>数量</th>
            <th>价格</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.symbol}</td>

              <td>
                {trade.trade_type}
              </td>

              <td>{trade.shares}</td>

              <td>${trade.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}