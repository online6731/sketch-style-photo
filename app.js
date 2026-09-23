const $ = (id) => document.getElementById(id);
const dict = {
  fa: {
    brand: "Sketch Style Photo", title: "عکست رو به اسکچ دفترچه‌ای تبدیل کن",
    subtitle: "عکس خودت رو بده + عکس استایل (همون طراحی با خودکار و ماژیک سبز/آبی) — خروجی با هوش مصنوعی ساخته می‌شه.",
    s1: "۱. عکس پرتره‌ات را آپلود کن", s2: "۲. عکس استایل را بده (اختیاری — پیش‌فرض همون اسکچ نمونه است)", s3: "۳. دکمه تبدیل را بزن و دانلود کن",
    uploadTitle: "آپلود", photoLabel: "📷 عکس کاربر *", styleLabel: "🎨 عکس استایل (اختیاری)",
    styleHint: "اگه چیزی ندی، از توضیح متنی استایل نمونه (خودکار + هایلایتر سبز/آبی + کاغذ دفترچه فنری) استفاده می‌شه. برای دقت بیشتر همون عکسی که فرستادی رو اینجا آپلود کن.",
    intensity: "میزان اسکچی شدن", low: "کم — نزدیک به عکس", med: "متوسط — متعادل", high: "زیاد — خیلی دستی و شلخته",
    convert: "✨ تبدیل کن", resultTitle: "نتیجه", empty: "هنوز چیزی ساخته نشده — یه عکس بده و تبدیل رو بزن.",
    download: "⬇ دانلود PNG", openFull: "باز کردن در تب جدید",
    keyTitle: "🔑 درباره API Key", keyText: "کلید OpenAI فقط روی سرور می‌مونه (server.js یا Vercel Env). هیچ‌وقت کلید رو داخل کد فرانت‌اند نذار.",
    foot: "ساخته‌شده برای استایل اسکچ دفترچه‌ای ✏️💚💙",
    needPhoto: "اول یه عکس کاربر انتخاب کن.", working: "⏳ داره با AI تبدیل می‌شه... (۱۰ تا ۳۰ ثانیه)", done: "✅ تموم شد!", fail: "❌ خطا: ",
    demo: "🤖 سرور AI در دسترس نبود — خروجی آفلاین (فیلتر محلی، کیفیت پایین‌تر) ساخته شد. برای خروجی اصلی، سایت را روی Vercel با OPENAI_API_KEY اجرا کن.",
  },
  en: {
    brand: "Sketch Style Photo", title: "Turn your photo into a notebook sketch",
    subtitle: "Upload your portrait + the style image (ballpoint pen with green/blue markers) — output is generated with AI.",
    s1: "1. Upload your portrait", s2: "2. Provide the style image (optional — sample sketch style is the default)", s3: "3. Hit convert and download",
    uploadTitle: "Upload", photoLabel: "📷 User photo *", styleLabel: "🎨 Style image (optional)",
    styleHint: "If you skip it, a text description of the sample style (ballpoint + green/blue highlighter + spiral notebook paper) is used. For best likeness, upload the sketch photo you sent.",
    intensity: "Sketch intensity", low: "Low — close to photo", med: "Medium — balanced", high: "High — very loose & scribbly",
    convert: "✨ Convert", resultTitle: "Result", empty: "Nothing yet — upload a photo and hit convert.",
    download: "⬇ Download PNG", openFull: "Open in new tab",
    keyTitle: "🔑 About the API key", keyText: "The OpenAI key stays only on the server (server.js or Vercel Env). Never put the key in frontend code.",
    foot: "Built for the notebook-sketch style ✏️💚💙",
    needPhoto: "Please choose a user photo first.", working: "⏳ Converting with AI... (10–30s)", done: "✅ Done!", fail: "❌ Error: ",
    demo: "🤖 AI server unreachable — offline fallback (local filter, lower quality) was used instead. For the real output, run the site on Vercel with OPENAI_API_KEY set.",
  },
};

let lang = "fa";
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[l][k]) el.textContent = dict[l][k];
  });
  $("btn-fa").classList.toggle("active", l === "fa");
  $("btn-en").classList.toggle("active", l === "en");
}
$("btn-fa").onclick = () => setLang("fa");
$("btn-en").onclick = () => setLang("en");

function previewFile(input, img) {
  input.addEventListener("change", () => {
    const f = input.files?.[0];
    if (!f) return;
    img.src = URL.createObjectURL(f);
    img.hidden = false;
  });
}
previewFile($("photo"), $("photo-preview"));
previewFile($("style"), $("style-preview"));

$("convert").onclick = async () => {
  const photo = $("photo").files?.[0];
  const style = $("style").files?.[0];
  const intensity = $("intensity").value;
  const status = $("status");
  if (!photo) { status.textContent = dict[lang].needPhoto; return; }

  const btn = $("convert");
  btn.disabled = true;
  status.textContent = dict[lang].working;
  $("result-empty").style.display = "none";

  try {
    const fd = new FormData();
    fd.append("photo", photo);
    if (style) fd.append("style", style);
    fd.append("intensity", intensity);

    const r = await fetch("/api/convert", { method: "POST", body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.detail || data?.error || r.statusText);

    showResult(data.image);
    status.textContent = dict[lang].done;
  } catch (e) {
    // Offline fallback: no backend (e.g. GitHub Pages) or AI error.
    // Build a local approximation: pen-gray sketch + green/blue marker bands.
    try {
      const demoUrl = await localSketch(photo, intensity);
      showResult(demoUrl);
      status.textContent = dict[lang].demo;
    } catch (e2) {
      status.textContent = dict[lang].fail + (e.message || e);
    }
  } finally {
    btn.disabled = false;
  }
};

function showResult(url) {
  const img = $("result");
  img.src = url;
  img.hidden = false;
  const dl = $("download");
  dl.href = url;
  dl.hidden = false;
  const open = $("open-full");
  open.hidden = false;
  open.onclick = () => window.open(url, "_blank");
}

// Local fallback filter: grayscale pen sketch + highlighter bands + paper tint.
function localSketch(file, intensity) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const S = 1024;
        const c = document.createElement("canvas");
        c.width = S; c.height = S;
        const x = c.getContext("2d");
        // cover-fit draw
        const r = Math.max(S / img.width, S / img.height);
        const w = img.width * r, h = img.height * r;
        x.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        // grayscale + contrast (pen feel)
        const d = x.getImageData(0, 0, S, S);
        const p = d.data;
        const strength = intensity === "high" ? 60 : intensity === "low" ? 20 : 40;
        for (let i = 0; i < p.length; i += 4) {
          let g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
          g = (g - 128) * (1 + strength / 100) + 128 + 18; // lighten like paper
          g = Math.max(0, Math.min(255, g));
          // posterize lightly for inked look
          g = Math.round(g / 24) * 24;
          p[i] = p[i + 1] = p[i + 2] = g;
        }
        x.putImageData(d, 0, 0);
        // paper tint
        x.globalAlpha = 0.12; x.fillStyle = "#efe8d8";
        x.fillRect(0, 0, S, S);
        x.globalAlpha = 1;
        // green highlighter bands (upper 55%)
        x.globalAlpha = 0.55; x.fillStyle = "#9be15d";
        let yy = 100;
        while (yy < S * 0.55) {
          const hh = 30 + Math.random() * 26;
          x.fillRect(Math.random() < 0.5 ? 0 : 30, yy, S, hh);
          yy += hh + 8;
        }
        // blue marker bands (lower 40%)
        x.globalAlpha = 0.5; x.fillStyle = "#8fc6ef";
        let y2 = S * 0.62;
        x.save();
        x.translate(S / 2, S * 0.8); x.rotate(-0.12); x.translate(-S / 2, -S * 0.8);
        while (y2 < S + 40) {
          x.fillRect(-40, y2, S + 80, 20 + Math.random() * 14);
          y2 += 34;
        }
        x.restore();
        x.globalAlpha = 1;
        // spiral holes hint along top
        x.fillStyle = "#f6f2e8";
        x.fillRect(0, 0, S, 78);
        x.fillStyle = "#14141a";
        for (let k = 0; k < 16; k++) {
          const hx = 32 + k * ((S - 64) / 15);
          x.beginPath(); x.arc(hx, 40, 13, 0, 7); x.fill();
        }
        resolve(c.toDataURL("image/png"));
      } catch (err) { reject(err); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => reject(new Error("Cannot read image file"));
    img.src = url;
  });
}

setLang("fa");
