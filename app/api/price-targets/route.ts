import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("price_targets")
    .select("*");

  if (!data) {
    return NextResponse.json([]);
  }

  const alerts = [];

  for (const t of data) {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${t.symbol}&token=${process.env.FINNHUB_API_KEY}`
    );

    const quote = await res.json();
    const price = Number(quote.c);

    // 📉 买入提醒
    if (t.buy_price && price <= t.buy_price) {
      alerts.push({
        symbol: t.symbol,
        type: "BUY",
        message: `已到买入目标价 $${t.buy_price}`,
      });
    }

    // 📈 卖出提醒
    if (t.sell_price && price >= t.sell_price) {
      alerts.push({
        symbol: t.symbol,
        type: "SELL",
        message: `已到卖出目标价 $${t.sell_price}`,
      });
    }

    // ⚠ 接近提醒
    if (
      t.buy_price &&
      price <= t.buy_price * 1.05 &&
      price > t.buy_price
    ) {
      alerts.push({
        symbol: t.symbol,
        type: "NEAR_BUY",
        message: "接近买入区间",
      });
    }

    if (
      t.sell_price &&
      price >= t.sell_price * 0.95 &&
      price < t.sell_price
    ) {
      alerts.push({
        symbol: t.symbol,
        type: "NEAR_SELL",
        message: "接近卖出区间",
      });
    }
  }

  return NextResponse.json(alerts);
}