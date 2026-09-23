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

    const img = $("result");
    img.src = data.image;
    img.hidden = false;
    const dl = $("download");
    dl.href = data.image;
    dl.hidden = false;
    const open = $("open-full");
    open.hidden = false;
    open.onclick = () => window.open(data.image, "_blank");
    status.textContent = dict[lang].done;
  } catch (e) {
    status.textContent = dict[lang].fail + (e.message || e);
  } finally {
    btn.disabled = false;
  }
};

setLang("fa");
