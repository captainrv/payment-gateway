// Import Express.js
const express = require('express');
const crypto = require("crypto");
const cors = require("cors");

// Create app
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// 🔐 PayU credentials
const MERCHANT_KEY = process.env.PAYU_KEY;
const SALT = process.env.PAYU_SALT;

// ✅ CREATE PAYMENT API
app.post("/payu/create", (req, res) => {

  const { type, id, amount, name, email } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount required" });
  }

  const txnid = `${type}_${id}_${Date.now()}`;
  const productinfo = type;

  // 🔥 HASH STRING
  const hashString =
    MERCHANT_KEY + "|" +
    txnid + "|" +
    amount + "|" +
    productinfo + "|" +
    name + "|" +
    email +
    "|||||||||||" +
    SALT;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  // ✅ PayU form data return
  res.json({
    key: MERCHANT_KEY,
    txnid: txnid,
    amount: amount,
    productinfo: productinfo,
    firstname: name,
    email: email,
    phone: "9999999999",

    // 🔗 redirect URLs
    surl: "https://payment-gateway-2u5d.onrender.com/payu/success",
    furl: "https://payment-gateway-2u5d.onrender.com/payu/failure",

    hash: hash,

    // 🧠 multi-company tracking
    udf1: type,
    udf2: id
  });

});

---

# 🔔 SUCCESS CALLBACK

app.post("/payu/success", (req, res) => {

  console.log("SUCCESS:", req.body);

  const {
    txnid,
    amount,
    status,
    hash,
    udf1,
    udf2
  } = req.body;

  // 🔐 VERIFY HASH (IMPORTANT)
  const reverseHashString =
    SALT + "|" +
    status + "|||||||||||" +
    req.body.email + "|" +
    req.body.firstname + "|" +
    req.body.productinfo + "|" +
    amount + "|" +
    txnid + "|" +
    MERCHANT_KEY;

  const verifyHash = crypto
    .createHash("sha512")
    .update(reverseHashString)
    .digest("hex");

  if (verifyHash !== hash) {
    return res.send("Hash mismatch ❌");
  }

  // ✅ payment verified
  console.log("Payment Verified ✅");

  // 👉 multi-company
  console.log("Type:", udf1);
  console.log("ID:", udf2);

  res.send("Payment Success");

});

---

# ❌ FAILURE CALLBACK

app.post("/payu/failure", (req, res) => {
  console.log("FAILED:", req.body);
  res.send("Payment Failed");
});

---

# ROOT

app.get("/", (req, res) => {
  res.send("PayU Server Running 🚀");
});

// START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
