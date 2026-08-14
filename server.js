const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Instagram AI Bot is running!");
});

// Meta webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive Instagram webhook
app.post("/webhook", async (req, res) => {
  try {
    console.log("Instagram webhook received:");
    console.log(JSON.stringify(req.body, null, 2));

    const message =
      req.body?.entry?.[0]?.messaging?.[0]?.message?.text;

    if (message) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a friendly Instagram DM assistant.
Reply naturally and briefly to this message:

${message}`,
      });

      console.log("Gemini reply:", response.text);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
