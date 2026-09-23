import formidable from "formidable";

export const config = { api: { bodyParser: false } };

function buildStylePrompt(intensity = "medium") {
  const strength =
    intensity === "low"
      ? "subtle stylization, keep the photo fairly realistic with light pen texture"
      : intensity === "high"
        ? "heavy stylization, very loose and scribbly, strongly abstracted like a quick ballpoint doodle"
        : "balanced stylization, clearly hand-drawn but still recognizable likeness";
  return `Redraw the FIRST image (user portrait/photo) in the exact hand-drawn style of the SECOND reference image. Style: messy black/dark-purple ballpoint pen cross-hatch sketch on off-white spiral notebook paper with punched holes along the TOP edge, upper background with horizontal lime-green highlighter strokes, lower foreground with diagonal light-blue marker strokes, loose student-doodle feel, no photorealism. Keep pose, likeness and framing from the FIRST image. Stylization strength: ${strength}. Output a single square illustration, no text, no watermark.`;
}

function parseForm(req) {
  const form = formidable({ multiples: true, maxFileSize: 10 * 1024 * 1024 });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY is not set." });
  try {
    const { fields, files } = await parseForm(req);
    const pick = (f) => (Array.isArray(f) ? f[0] : f);
    const photo = pick(files.photo);
    const style = pick(files.style);
    if (!photo?.filepath) return res.status(400).json({ error: "No photo uploaded." });
    const intensity = String(fields.intensity?.[0] ?? fields.intensity ?? "medium");

    const { readFile } = await import("node:fs/promises");
    const photoBuf = await readFile(photo.filepath);
    const form = new FormData();
    form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
    form.append("prompt", buildStylePrompt(intensity));
    form.append("size", "1024x1024");
    form.append("image[]", new Blob([photoBuf], { type: photo.mimetype || "image/png" }), "photo.png");
    if (style?.filepath) {
      const styleBuf = await readFile(style.filepath);
      form.append("image[]", new Blob([styleBuf], { type: style.mimetype || "image/png" }), "style.png");
    }

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!r.ok) return res.status(r.status).json({ error: "OpenAI API error", detail: (await r.text()).slice(0, 2000) });
    const data = await r.json();
    const b64 = data?.data?.[0]?.b64_json;
    const url = data?.data?.[0]?.url;
    return res.status(200).json({ image: b64 ? `data:image/png;base64,${b64}` : url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e).slice(0, 1000) });
  }
}
