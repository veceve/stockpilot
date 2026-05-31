export async function getQuote(
  symbol: string
) {
  const res = await fetch(
    `/api/quote?symbol=${symbol}`
  );

  return res.json();
}