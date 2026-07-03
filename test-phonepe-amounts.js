require("dotenv").config({ path: ".env" });
const crypto = require("crypto");

async function run() {
  const baseUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
  const url = `${baseUrl}/v1/oauth/token`;
  const body = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID,
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    client_version: process.env.PHONEPE_CLIENT_VERSION || "1",
    grant_type: "client_credentials",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const tokenData = await res.json();
  const token = tokenData.access_token;

  const payUrl = `${baseUrl}/checkout/v2/pay`;
  
  for (const amount of [10000, 20000, 30000]) {
    const payload = {
      merchantOrderId: "TEST-" + Date.now(),
      amount,
      expireAfter: 1200,
      redirectUrl: "http://localhost:3000/api/payments/redirect",
      redirectMode: "REDIRECT",
      paymentFlow: { type: "PG_CHECKOUT", message: "Test Payment" },
    };

    const payRes = await fetch(payUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `O-Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const payData = await payRes.json();
    console.log(`Amount: ${amount} => state: ${payData.state}, redirectUrl: ${payData.redirectUrl}`);
  }
}
run().catch(console.error);
