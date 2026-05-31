import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: trades } = await supabase
    .from("trades")
    .select("*");

  const { data: holdings } = await supabase
    .from("watchlists")
    .select("*");

  if (!trades) {
    return NextResponse.json({
      error: "no trades",
    });
  }

  // 计算持仓
  const map: Record<string, any> = {};

  trades.forEach((t) => {
    if (!map[t.symbol]) {
      map[t.symbol] = {
        shares: 0,
        cost: 0,
      };
    }

    if (t.trade_type === "BUY") {
      map[t.symbol].shares += Number(
        t.shares
      );

      map[t.symbol].cost +=
        Number(t.shares) *
        Number(t.price);
    }
  });

  let totalCost = 0;
  let totalValue = 0;

  // 获取行情
  for (const symbol in map) {
    const quoteRes = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );

    const quote = await quoteRes.json();

    const price = Number(quote.c);

    const shares = map[symbol].shares;
    const cost = map[symbol].cost;

    totalCost += cost;
    totalValue += price * shares;
  }

  const profit = totalValue - totalCost;

  const profitPercent =
    totalCost === 0
      ? 0
      : (profit / totalCost) * 100;

  return NextResponse.json({
    totalValue,
    totalCost,
    profit,
    profitPercent,
    holdingsCount:
      Object.keys(map).length,
  });
}