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

  console.log("Fetching token...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  
  if (!res.ok) {
    console.error("Token fail:", await res.text());
    return;
  }
  const tokenData = await res.json();
  const token = tokenData.access_token;
  console.log("Got token.");

  const payUrl = `${baseUrl}/checkout/v2/pay`;
  const payload = {
    merchantOrderId: "TEST-" + Date.now(),
    amount: 15000,
    expireAfter: 1200,
    redirectUrl: "http://localhost:3000/api/payments/redirect",
    redirectMode: "REDIRECT",
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Test Payment",
    },
  };

  console.log("Creating order...");
  const payRes = await fetch(payUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  console.log("Status:", payRes.status);
  const payData = await payRes.json();
  console.log("Response:", JSON.stringify(payData, null, 2));
}

run().catch(console.error);
