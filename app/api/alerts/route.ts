import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // 1. 获取 trades
  const { data: trades } = await supabase
    .from("trades")
    .select("*");

  // 2. 获取仓位计划
  const { data: plans } = await supabase
    .from("position_plans")
    .select("*");

  if (!trades) {
    return NextResponse.json([]);
  }

  // 3. 计算持仓
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
        Number(t.shares) *
        Number(t.price);
    }
  });

  // 4. 获取行情 + 生成提醒
  const alerts = [];

  for (const symbol in map) {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );

    const quote = await res.json();
    const price = Number(quote.c);

    const shares = map[symbol].shares;
    const cost = map[symbol].cost;

    const marketValue = price * shares;
    const currentPercent =
      cost === 0
        ? 0
        : (marketValue / cost - 1) *
          100;

    // 🔥 规则1：严重盈利/亏损
    if (currentPercent > 20) {
      alerts.push({
        symbol,
        type: "PROFIT",
        message:
          "已盈利超过20%，可考虑止盈",
      });
    }

    if (currentPercent < -10) {
      alerts.push({
        symbol,
        type: "RISK",
        message:
          "亏损超过10%，需检查逻辑",
      });
    }

    // 🔥 规则2：仓位偏差
    const plan = plans?.find(
      (p) => p.symbol === symbol
    );

    if (plan) {
      const totalValue =
        Object.values(map).reduce(
          (sum: number, v: any) =>
            sum +
            price * v.shares,
          0
        );

      const currentWeight =
        (marketValue / totalValue) *
        100;

      const diff =
        currentWeight -
        plan.target_percent;

      if (diff > 10) {
        alerts.push({
          symbol,
          type: "OVERWEIGHT",
          message:
            "仓位超配超过10%",
        });
      }

      if (diff < -10) {
        alerts.push({
          symbol,
          type: "UNDERWEIGHT",
          message:
            "仓位低于目标10%",
        });
      }
    }
  }

  return NextResponse.json(alerts);
}