# Sketch Style Photo ✏️💚💙

[فارسی](#فارسی) | [English](#english)

---

## فارسی

سایت دوزبانه (فا/ان) که **عکس کاربر** را می‌گیرد و با **AI API** آن را به استایل **اسکچ دفترچه‌ای** نمونه تبدیل می‌کند:

- طراحی شلخته با **خودکار مشکی/سرمه‌ای** (هاشور ضربدری)
- کاغذ **دفترچه فنری** با سوراخ‌های بالای صفحه
- پس‌زمینه با **ماژیک هایلایتر سبز لیمویی** (خط‌های افقی)
- پیش‌زمینه/میز با **ماژیک آبی روشن** (خط‌های مورب)

### اجرای محلی

```powershell
Copy-Item .env.example .env
# داخل .env مقدار OPENAI_API_KEY را بگذار
npm install; if ($?) { npm start }
# باز کن: http://localhost:3000
```

### دیپلوی

- **Vercel (پیشنهادی):** همین ریپو را ایمپورت کن، در Env مقدار `OPENAI_API_KEY` را بگذار. فرانت‌اند از `/` و API از `/api/convert` سرو می‌شود (`api/convert.js` + `vercel.json` آماده است).
- **Render / VPS:** دستور `npm start` با Env مشابه. `server.js` هم فرانت را سرو می‌کند هم API را.

### نکته استایل

برای بیشترین شباهت به نمونه، همان عکسی که فرستادی (دختر با خودکار + سبز/آبی) را موقع استفاده در بخش «عکس استایل» آپلود کن. می‌توانی آن را در `assets/style-reference.jpg` هم ذخیره کنی تا همیشه همراه ریپو باشد.

> ⚠️ کلید OpenAI فقط روی سرور می‌ماند. هرگز کلید را در کد فرانت‌اند نگذار.

---

## English

Bilingual (FA/EN) site that takes a **user photo** and converts it into the sample **notebook-sketch style** via an **AI API**:

- messy **ballpoint pen** cross-hatch (black/dark-purple)
- **spiral notebook paper** with punched holes on top
- upper background with **lime-green highlighter** strokes
- lower foreground/table with **light-blue marker** strokes

### Run locally

```powershell
Copy-Item .env.example .env
# put your OPENAI_API_KEY inside .env
npm install; if ($?) { npm start }
# open: http://localhost:3000
```

### Deploy

- **Vercel (recommended):** import this repo, set `OPENAI_API_KEY` env. Frontend at `/`, API at `/api/convert` (see `api/convert.js` + `vercel.json`).
- **Render / VPS:** run `npm start` with the same env. `server.js` serves both frontend and API.

### Style tip

For closest match to the sample, upload the sketch photo you sent (pen + green/blue markers) in the “Style image” field. You can also store it at `assets/style-reference.jpg`.

> ⚠️ The OpenAI key stays server-side only. Never embed it in frontend code.
