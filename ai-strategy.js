import express from "express";
import Replicate from "replicate";
import 'dotenv/config';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post("/strategy", async (req, res) => {
  const { leclerc, lewis, lap } = req.body;

  const prompt = `
  You are an F1 race strategist.
  The race has just finished.
  Charles Leclerc: avg speed ${leclerc.speed.toFixed(1)} km/h, tire wear ${leclerc.tireWear.toFixed(1)}%, fuel left ${leclerc.fuel.toFixed(1)}%.
  Lewis Hamilton: avg speed ${lewis.speed.toFixed(1)} km/h, tire wear ${lewis.tireWear.toFixed(1)}%, fuel left ${lewis.fuel.toFixed(1)}%.
  Provide a short race analysis (max 3 sentences) summarizing performance and key pit strategy insights.
  `;

  try {
    let response = "";
    for await (const event of replicate.stream("ibm-granite/granite-3.3-8b-instruct", {
      input: { prompt, max_tokens: 100 },
    })) {
      response += event.toString();
    }

    res.json({ insight: response.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI strategy failed." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚦 AI Strategy API running on port ${PORT}`));
