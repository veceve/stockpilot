import { NextRequest } from "next/server";
import { getQuote } from "@/lib/finnhub";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return Response.json({
      error: "missing symbol",
    });
  }

  const data = await getQuote(symbol);

  return Response.json(data);
}