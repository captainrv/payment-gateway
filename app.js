// Import Express.js
const express = require('express');
const Razorpay = require("razorpay");
const cors = require("cors");

// Create an Express app
const app = express();

// CORS allow
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.KEY,
  key_secret: process.env.SECRET_KEY
});


// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;



// Route for GET requests
app.get('/', (req, res) => {
  const payload = req.query;
  console.log(JSON.stringify(payload, null, 2));
  res.status(200).send({ payload: payload });
});

// Create Order API (POST)
app.post("/order", async (req, res) => {

  const { type, id, amount, name } = req.body;

  if (!amount) {
    return res.status(400).json({
      error: "Amount required"
    });
  }

  const options = {
    amount: amount, // paise
    currency: "INR",
    receipt: `${type}_${id}`
  };

  try {

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: order
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Order creation failed"
    });

  }

});


// Route for POST requests
app.post('/', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).send({ data: req.body });
});



app.get("/order", async (req, res) => {

  const options = {
    amount: 50000, // 500 rs (paise me)
    currency: "INR",
    receipt: "receipt_order_1"
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }

});


// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
