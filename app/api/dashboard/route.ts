import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: trades } = await supabase
    .from("trades")
    .select("*");

  const { data: plans } = await supabase
    .from("position_plans")
    .select("*");

  const { data: targets } = await supabase
    .from("price_targets")
    .select("*");

  if (!trades) return NextResponse.json({});

  // 📦 持仓计算
  const map: Record<string, any> = {};

  trades.forEach((t) => {
    if (!map[t.symbol]) {
      map[t.symbol] = {
        shares: 0,
        cost: 0,
      };
    }

    if (t.trade_type === "BUY") {
      map[t.symbol].shares += Number(t.shares);
      map[t.symbol].cost +=
        Number(t.shares) * Number(t.price);
    }
  });

  const list = [];
  let totalValue = 0;

  for (const symbol in map) {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );

    const quote = await res.json();
    const price = Number(quote.c);

    const shares = map[symbol].shares;
    const cost = map[symbol].cost;

    const marketValue = price * shares;
    totalValue += marketValue;

    const avgCost = cost / shares;
    const profitPercent =
      ((price - avgCost) / avgCost) * 100;

    const plan = plans?.find(
      (p) => p.symbol === symbol
    );

    const target = targets?.find(
      (t) => t.symbol === symbol
    );

    let status = "正常";

    // 📌 仓位状态
    if (plan) {
      const diff = shares - plan.target_shares;

      if (diff > 0) status = "⚠ 超配";
      if (diff < 0) status = "⬇ 低配";
    }

    // 📌 目标价状态覆盖提示
    if (target) {
      if (
        target.sell_price &&
        price >= target.sell_price
      ) {
        status = "📈 接近卖出";
      }
      if (
        target.buy_price &&
        price <= target.buy_price
      ) {
        status = "📉 接近买入";
      }
    }

    list.push({
      symbol,
      shares,
      avgCost,
      price,
      marketValue,
      profitPercent,
      status,
    });
  }

  return NextResponse.json({
    totalValue,
    list,
  });
}