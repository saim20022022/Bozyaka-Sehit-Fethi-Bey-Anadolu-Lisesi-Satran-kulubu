const CONFIG = {
  // Başvuru formunu Google Sheets'e kaydeden mevcut Apps Script URL'si.
  googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbxXN-tOiLBBbRXD0O5BxqYuu-9vk3ku5TUPPjIKFY4sX9KIEvIYknCvXJvuSiKiMw6p/exec",

  // Onaylananlar sekmesinin Web'de yayınlanmış CSV bağlantısı.
  approvedCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu_K_a57QotsKRI7TfAmvHKKeZp3ybJOVGCD10O_WTi6QetKRmzuIk787FJR9WQixiNWAUCoDGdo5K/pub?gid=1242253073&single=true&output=csv",

  teamUrl: "https://lichess.org/team/bozyaka-sfbal-satranc-kulubu",
  startDate: "2026-05-11T20:00:00+03:00"
};

const APPROVED_PARTICIPANTS = [];
const TOURNAMENT_STANDINGS = [];

const form = document.getElementById("applicationForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const approvedBody = document.getElementById("approvedBody");
const standingsBody = document.getElementById("standingsBody");
const approvedSearch = document.getElementById("approvedSearch");
const standingsSearch = document.getElementById("standingsSearch");
const copyFormatButton = document.getElementById("copyFormatButton");

let approvedData = [...APPROVED_PARTICIPANTS];
let standingsData = [...TOURNAMENT_STANDINGS];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = new URLSearchParams();

  payload.append("kaynak", window.location.href);
  payload.append("user_agent", navigator.userAgent);

  for (const [key, value] of formData.entries()) {
    payload.append(key, value);
  }

  submitButton.disabled = true;
  setMessage("Başvuru gönderiliyor...", "");

  try {
    await fetch(CONFIG.googleAppsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: payload.toString()
    });

    setMessage("Başvuru alındı. Lichess takım sayfasına yönlendiriliyorsunuz...", "success");
    form.reset();

    // Pop-up engelleyicilere takılmamak için yeni pencere açmıyoruz.
    // Aynı sekmede Lichess takım sayfasına yönlendiriyoruz.
    setTimeout(() => {
      window.location.href = CONFIG.teamUrl;
    }, 900);
  } catch (error) {
    setMessage("Başvuru gönderilemedi. İnternet bağlantısını kontrol edip tekrar deneyin.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

copyFormatButton.addEventListener("click", async () => {
  const text = "Ad Soyad:\nSınıf:\nOkul No:\nLichess Kullanıcı Adı:";
  try {
    await navigator.clipboard.writeText(text);
    copyFormatButton.textContent = "Kopyalandı";
    setTimeout(() => copyFormatButton.textContent = "Formatı Kopyala", 1200);
  } catch {
    alert(text);
  }
});

function setMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type || ""}`.trim();
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("tr-TR");
}

function matchesSearch(item, query) {
  if (!query) return true;
  const text = normalize(Object.values(item).join(" "));
  return text.includes(normalize(query));
}

function renderApproved() {
  const query = approvedSearch.value.trim();
  const filtered = approvedData.filter((item) => matchesSearch(item, query));

  if (filtered.length === 0) {
    approvedBody.innerHTML = `<tr class="empty-row"><td colspan="4">Henüz onaylanan katılımcı eklenmedi.</td></tr>`;
    return;
  }

  approvedBody.innerHTML = filtered.map((item) => `
    <tr>
      <td>${escapeHtml(item.adSoyad)}</td>
      <td>${escapeHtml(item.sinif)}</td>
      <td>${escapeHtml(item.okulNo || "")}</td>
      <td>${escapeHtml(item.kullaniciAdi)}</td>
    </tr>
  `).join("");
}

function renderStandings() {
  const query = standingsSearch.value.trim();
  const filtered = standingsData.filter((item) => matchesSearch(item, query));

  if (filtered.length === 0) {
    standingsBody.innerHTML = `<tr class="empty-row"><td colspan="6">Turnuva sıralaması henüz eklenmedi.</td></tr>`;
    return;
  }

  standingsBody.innerHTML = filtered.map((item, index) => {
    const rank = item.sira || index + 1;
    return `
      <tr>
        <td><span class="rank-pill">${escapeHtml(rank)}</span></td>
        <td>${escapeHtml(item.adSoyad)}</td>
        <td>${escapeHtml(item.sinif)}</td>
        <td>${escapeHtml(item.okulNo || "")}</td>
        <td>${escapeHtml(item.kullaniciAdi)}</td>
        <td>${escapeHtml(item.puan)}</td>
        <td>${escapeHtml(item.durum)}</td>
      </tr>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadOptionalJson() {
  approvedData = [];
  standingsData = [];
  approvedBody.innerHTML = `<tr class="empty-row"><td colspan="4">Onaylananlar listesi yükleniyor...</td></tr>`;
  renderStandings();
  await loadApprovedFromPublishedCsv();
}

async function loadApprovedFromPublishedCsv() {
  try {
    const response = await fetch(CONFIG.approvedCsvUrl + "&cache=" + Date.now(), {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("CSV okunamadı");
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    // İlk satır başlık: Ad Soyad | Sınıf | Okul No | Lichess Kullanıcı Adı
    const list = rows.slice(1)
      .map((row) => ({
        adSoyad: row[0] || "",
        sinif: row[1] || "",
        okulNo: row[2] || "",
        kullaniciAdi: row[3] || ""
      }))
      .filter((item) => item.adSoyad.trim() && item.kullaniciAdi.trim());

    approvedData = mergeParticipants([], list);
    renderApproved();
  } catch (error) {
    approvedBody.innerHTML = `<tr class="empty-row"><td colspan="4">Onaylananlar sekmesi okunamadı.</td></tr>`;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function mergeParticipants(localList, sheetList) {
  const map = new Map();

  [...localList, ...sheetList].forEach((item) => {
    const cleanItem = {
      adSoyad: String(item.adSoyad || "").trim(),
      sinif: String(item.sinif || "").trim(),
      okulNo: String(item.okulNo || "").trim(),
      kullaniciAdi: String(item.kullaniciAdi || item.lichess || "").trim()
    };

    if (!cleanItem.adSoyad || !cleanItem.kullaniciAdi) return;

    const key = normalize(`${cleanItem.kullaniciAdi}|${cleanItem.okulNo}`);
    map.set(key, cleanItem);
  });

  return Array.from(map.values()).sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"));
}

function updateCountdown() {
  const target = new Date(CONFIG.startDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

approvedSearch.addEventListener("input", renderApproved);
standingsSearch.addEventListener("input", renderStandings);

loadOptionalJson();
updateCountdown();
setInterval(updateCountdown, 1000);
