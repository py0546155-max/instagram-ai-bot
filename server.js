const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
  res.send("Instagram AI Bot is running!");
});

// Instagram webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Instagram webhook events
app.post("/webhook", async (req, res) => {
  try {
    console.log("Instagram webhook received:");
    console.log(JSON.stringify(req.body, null, 2));

    // Abhi sirf webhook receive kar rahe hain.
    // Gemini + Instagram reply next step me connect karenge.

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
