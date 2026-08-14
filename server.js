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

// Receive Instagram messages
app.post("/webhook", async (req, res) => {
  try {
    console.log("Instagram webhook received:");
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body?.entry?.[0]?.messaging?.[0];

    const messageText = event?.message?.text;
    const senderId = event?.sender?.id;

    // Ignore events that are not actual text messages
    if (!messageText || !senderId) {
      return res.sendStatus(200);
    }

    console.log("Incoming message:", messageText);
    console.log("Sender ID:", senderId);

    // Ask Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a friendly Instagram DM assistant.
Reply naturally, helpfully, and briefly.

User message:
${messageText}`,
    });

    const reply = result.text;

    console.log("Gemini reply:", reply);

    // Send reply back to Instagram
    const response = await fetch(
      `https://graph.instagram.com/v26.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          recipient: {
            id: senderId,
          },
          message: {
            text: reply,
          },
        }),
      }
    );

    const responseData = await response.text();

    console.log("Instagram send response:", response.status, responseData);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
