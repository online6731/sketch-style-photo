import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
});

app.use(cors());
app.use(express.static(__dirname));

function buildStylePrompt(intensity = "medium") {
  const strength =
    intensity === "low"
      ? "subtle stylization, keep the photo fairly realistic with light pen texture"
      : intensity === "high"
        ? "heavy stylization, very loose and scribbly, strongly abstracted like a quick ballpoint doodle"
        : "balanced stylization, clearly hand-drawn but still recognizable likeness";

  return `Redraw the FIRST image (user portrait/photo) in the exact hand-drawn style of the SECOND reference image.

Style description (from reference):
- messy black/dark-purple ballpoint pen cross-hatch sketch, visible scribble strokes and uneven line weight
- off-white spiral notebook paper background with a row of punched holes along the TOP edge
- upper background filled with horizontal lime-green highlighter marker strokes (with white paper gaps)
- lower foreground (table/desk area) filled with diagonal light-blue marker strokes
- loose, quick, imperfect student-doodle feel, no photorealism, no smooth digital shading
- keep the person's pose, face likeness, framing and composition from the FIRST image

Stylization strength: ${strength}.
Output: a single square illustration, no text, no watermark, no extra hands holding paper, just the sketch itself on notebook paper.`;
}

app.post("/api/convert", upload.fields([{ name: "photo", maxCount: 1 }, { name: "style", maxCount: 1 }]), async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server. Copy .env.example to .env and add your key." });
    }
    const photo = req.files?.photo?.[0];
    const style = req.files?.style?.[0];
    if (!photo) return res.status(400).json({ error: "No photo uploaded (field name must be 'photo')." });

    const intensity = (req.body?.intensity || "medium").toString();
    const prompt = buildStylePrompt(intensity);

    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("image[]", new Blob([photo.buffer], { type: photo.mimetype || "image/png" }), photo.originalname || "photo.png");
    if (style) {
      form.append("image[]", new Blob([style.buffer], { type: style.mimetype || "image/png" }), style.originalname || "style.png");
    }

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "OpenAI API error", detail: text.slice(0, 2000) });
    }
    const data = await r.json();
    const b64 = data?.data?.[0]?.b64_json;
    const url = data?.data?.[0]?.url;
    if (!b64 && !url) return res.status(502).json({ error: "Unexpected OpenAI response", detail: JSON.stringify(data).slice(0, 2000) });
    return res.json({ image: b64 ? `data:image/png;base64,${b64}` : url, model: MODEL });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: String(err?.message || err).slice(0, 1000) });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, model: MODEL, hasKey: Boolean(OPENAI_API_KEY) }));

app.listen(PORT, () => console.log(`sketch-style-photo running on http://localhost:${PORT}`));
