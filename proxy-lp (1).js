export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { wallet } = await req.json();
  const headers = { 'accept': 'application/json' };

  try {
    const res = await fetch(
      `https://api.raydium.io/v2/clmm/user_positions?owner=${wallet}`,
      { headers }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch LPs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();

    const positions = (data?.positions || []).map(pos => ({
      id: pos.positionId,
      pool: pos.poolName,
      tokenA: pos.tokenA.symbol,
      tokenB: pos.tokenB.symbol,
      amountA: Number(pos.amountA.amountUi).toFixed(4),
      amountB: Number(pos.amountB.amountUi).toFixed(4),
      range: pos.inRange ? "In Range" : "Out of Range",
      value: Number(pos.liquidityValue).toFixed(2),
      apr: Number(pos.apr).toFixed(2),
      pendingFees: pos.pendingFeesUi
    }));

    return new Response(JSON.stringify({ positions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
