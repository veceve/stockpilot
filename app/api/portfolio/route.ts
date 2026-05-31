import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: trades } = await supabase
    .from("trades")
    .select("*");

  const { data: targets } = await supabase
    .from("price_targets")
    .select("*");

  if (!trades) {
    return NextResponse.json([]);
  }

  // 1️⃣ 计算持仓
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

  // 2️⃣ 获取行情 + 组合数据
  const result = [];

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

    const target = targets?.find(
      (t) => t.symbol === symbol
    );

    let status = "正常";

    if (target) {
      if (
        target.sell_price &&
        price >= target.sell_price
      ) {
        status = "📈 接近卖出";
      } else if (
        target.buy_price &&
        price <= target.buy_price
      ) {
        status = "📉 接近买入";
      }
    }

    result.push({
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
    list: result,
  });
}