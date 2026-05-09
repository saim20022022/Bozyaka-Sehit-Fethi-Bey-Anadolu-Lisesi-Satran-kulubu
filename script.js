const CONFIG = {
  // Başvuru formunu Google Sheets'e kaydeden mevcut Apps Script URL'si.
  // Form çalışıyordu, bu bağlantıya dokunulmadı.
  googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbxXN-tOiLBBbRXD0O5BxqYuu-9vk3ku5TUPPjIKFY4sX9KIEvIYknCvXJvuSiKiMw6p/exec",

  // Onaylananlar sekmesi bilgileri.
  // Bu bölüm artık tek bir hatalı CSV linkine bağlı değil.
  sheetId: "1NzjcxucHhzUdgRBO7uzQXiykm9BiHHvLtZRod80gGvI",
  approvedSheetGid: "1242253073",

  // Web'de yayınla penceresinden alınan bağlantı farklı biçimlerde denenir.
  // 0/O karışıklığına karşı birden fazla sağlam kaynak otomatik denenir.
  publishedCsvCandidates: [
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu_K_a57QotsKRI7TfAmvHKKeZp3ybJOVGCD1OO_WTi6QetKRmzuIk787FJR9WQixiNWAUCoDGdo5K/pub?gid=1242253073&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu_K_a57QotsKRI7TfAmvHKKeZp3ybJOVGCD10O_WTi6QetKRmzuIk787FJR9WQixiNWAUCoDGdo5K/pub?gid=1242253073&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu_K_a57QotsKRI7TfAmvHKKeZp3ybJ0VGCD1OO_WTi6QetKRmzuIk787FJR9WQixiNWAUCoDGdo5K/pub?gid=1242253073&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu_K_a57QotsKRI7TfAmvHKKeZp3ybJ0VGCD10O_WTi6QetKRmzuIk787FJR9WQixiNWAUCoDGdo5K/pub?gid=1242253073&single=true&output=csv"
  ],

  teamUrl: "https://lichess.org/team/bozyaka-sfbal-satranc-kulubu",
  startDate: "2026-05-11T20:00:00+03:00"
};

const FALLBACK_APPROVED_PARTICIPANTS = [
  { adSoyad: "İnci Nur Ekinci", sinif: "12/D", okulNo: "901", kullaniciAdi: "inclalsqw" },
  { adSoyad: "Bekir Alperen Şulan", sinif: "9/G", okulNo: "798", kullaniciAdi: "alperensln" },
  { adSoyad: "Deniz Aydınşen", sinif: "11/A", okulNo: "1596", kullaniciAdi: "Paylanco" },
  { adSoyad: "Arda Güler", sinif: "11/A", okulNo: "782", kullaniciAdi: "Ardaazingo" },
  { adSoyad: "Emir Ali Atalay", sinif: "9/B", okulNo: "290", kullaniciAdi: "EmirAli7635" }
];

const TOURNAMENT_STANDINGS = [];

const form = document.getElementById("applicationForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const approvedBody = document.getElementById("approvedBody");
const standingsBody = document.getElementById("standingsBody");
const approvedSearch = document.getElementById("approvedSearch");
const standingsSearch = document.getElementById("standingsSearch");
const copyFormatButton = document.getElementById("copyFormatButton");

let approvedData = [];
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
    standingsBody.innerHTML = `<tr class="empty-row"><td colspan="7">Turnuva sıralaması henüz eklenmedi.</td></tr>`;
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
  approvedBody.innerHTML = `<tr class="empty-row"><td colspan="4">Onaylananlar listesi yükleniyor...</td></tr>`;
  renderStandings();

  const approvedList = await loadApprovedParticipantsSafely();
  approvedData = approvedList.length > 0
    ? mergeParticipants([], approvedList)
    : mergeParticipants([], FALLBACK_APPROVED_PARTICIPANTS);

  renderApproved();
}

async function loadApprovedParticipantsSafely() {
  const loaders = [
    loadApprovedWithGoogleVisualization,
    loadApprovedFromOriginalPubCsv,
    loadApprovedFromOriginalExportCsv,
    loadApprovedFromPublishedCsvCandidates
  ];

  for (const loader of loaders) {
    try {
      const list = await loader();
      if (Array.isArray(list) && list.length > 0) {
        console.info("Onaylananlar listesi yüklendi:", loader.name, list.length);
        return list;
      }
    } catch (error) {
      console.warn("Onaylananlar kaynağı denenemedi:", loader.name, error);
    }
  }

  console.warn("Google Sheets bağlantısı kurulamadı. Yedek liste gösteriliyor.");
  return [];
}

function loadApprovedWithGoogleVisualization() {
  return new Promise((resolve, reject) => {
    const callbackName = `__bozyakaSheetCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Visualization zaman aşımı"));
    }, 9000);

    function cleanup() {
      window.clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
    }

    window[callbackName] = (response) => {
      try {
        cleanup();

        if (!response || response.status === "error") {
          reject(new Error(response?.errors?.[0]?.detailed_message || "Google Visualization hata verdi"));
          return;
        }

        const rows = gvizResponseToRows(response);
        resolve(rowsToApprovedList(rows));
      } catch (error) {
        reject(error);
      }
    };

    const query = encodeURIComponent("select A,B,C,D");
    script.onerror = () => {
      cleanup();
      reject(new Error("Google Visualization script yüklenemedi"));
    };
    script.src = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?gid=${CONFIG.approvedSheetGid}&headers=1&tq=${query}&tqx=out:json;responseHandler:${callbackName}&cache=${Date.now()}`;
    document.head.appendChild(script);
  });
}

function gvizResponseToRows(response) {
  const table = response.table;
  if (!table || !Array.isArray(table.rows)) return [];

  const header = (table.cols || []).map((col) => col.label || col.id || "");
  const body = table.rows.map((row) => (row.c || []).map((cell) => {
    if (!cell) return "";
    return cell.f ?? cell.v ?? "";
  }));

  return [header, ...body];
}

async function loadApprovedFromOriginalPubCsv() {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/pub?gid=${CONFIG.approvedSheetGid}&single=true&output=csv`;
  return loadApprovedFromCsvUrl(url);
}

async function loadApprovedFromOriginalExportCsv() {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=${CONFIG.approvedSheetGid}`;
  return loadApprovedFromCsvUrl(url);
}

async function loadApprovedFromPublishedCsvCandidates() {
  for (const url of CONFIG.publishedCsvCandidates) {
    try {
      const list = await loadApprovedFromCsvUrl(url);
      if (list.length > 0) return list;
    } catch (error) {
      console.warn("CSV aday linki çalışmadı:", url, error);
    }
  }
  return [];
}

async function loadApprovedFromCsvUrl(url) {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}cache=${Date.now()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`CSV okunamadı: ${response.status}`);
  }

  const csvText = await response.text();
  return rowsToApprovedList(parseCsv(csvText));
}

function rowsToApprovedList(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return [];

  return rows.slice(1)
    .map((row) => ({
      adSoyad: row[0] || "",
      sinif: row[1] || "",
      okulNo: row[2] || "",
      kullaniciAdi: row[3] || ""
    }))
    .filter((item) => item.adSoyad.trim() && item.kullaniciAdi.trim());
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

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;
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
