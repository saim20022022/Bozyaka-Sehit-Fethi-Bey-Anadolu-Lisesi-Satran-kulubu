const CONFIG = {
  schoolName: "Bozyaka Şehit Fethi Bey Anadolu Lisesi",
  teamUrl: "http://lichess.org/team/sehit-fethi-bey-anadolu-lisesi",

  // Turnuva linki hazır olunca aşağıdaki değeri değiştir:
  tournamentUrl: "",

  // Turnuva tarihi hazır olunca ISO formatında değiştir. Örnek: "2026-05-20T20:00:00+03:00"
  tournamentDate: "",

  tournamentDateLabel: "Tarih ve saat yakında duyurulacaktır."
};

function setupLinks() {
  const buttons = [document.getElementById("tournamentButton"), document.getElementById("tournamentButton2")];
  const notice = document.getElementById("tournamentNotice");

  buttons.forEach((btn) => {
    if (!btn) return;
    if (CONFIG.tournamentUrl) {
      btn.href = CONFIG.tournamentUrl;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.textContent = "Turnuva Sayfasına Git";
    } else {
      btn.href = "#katilim";
      btn.removeAttribute("target");
      btn.textContent = btn.id === "tournamentButton2" ? "Turnuva Linki Yakında" : "Turnuva Sayfası Yakında";
    }
  });

  if (notice) {
    notice.textContent = CONFIG.tournamentUrl
      ? "Turnuva sayfası hazır. Butona basarak Lichess turnuva ekranına gidebilirsin."
      : "Turnuva bağlantısı oluşturulduğunda buradaki buton otomatik güncellenecek.";
  }
}

function setupCountdown() {
  const dateText = document.getElementById("dateText");
  const ids = ["days", "hours", "minutes", "seconds"];
  const els = ids.map((id) => document.getElementById(id));

  if (dateText) dateText.textContent = CONFIG.tournamentDateLabel;

  if (!CONFIG.tournamentDate) {
    els.forEach((el) => { if (el) el.textContent = "--"; });
    return;
  }

  const target = new Date(CONFIG.tournamentDate).getTime();
  if (Number.isNaN(target)) return;

  const fmt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul"
  });
  if (dateText) dateText.textContent = fmt.format(new Date(target));

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      els[0].textContent = "0";
      els[1].textContent = "0";
      els[2].textContent = "0";
      els[3].textContent = "0";
      if (dateText) dateText.textContent = "Turnuva başladı veya tamamlandı.";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    els[0].textContent = days;
    els[1].textContent = hours.toString().padStart(2, "0");
    els[2].textContent = minutes.toString().padStart(2, "0");
    els[3].textContent = seconds.toString().padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

setupLinks();
setupCountdown();


function encodeFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

function saveLocalApplication(data) {
  const key = "bozyaka_satranc_basvurulari";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push({ ...data, tarih: new Date().toLocaleString("tr-TR") });
  localStorage.setItem(key, JSON.stringify(list));
}

function setupApplicationForm() {
  const form = document.getElementById("applicationForm");
  const message = document.getElementById("formMessage");
  const copyBtn = document.getElementById("copyTemplateButton");
  const copyTemplate = document.getElementById("copyTemplate");

  if (copyBtn && copyTemplate) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyTemplate.textContent.trim());
        copyBtn.textContent = "Kopyalandı";
        setTimeout(() => (copyBtn.textContent = "Bilgi Formatını Kopyala"), 1800);
      } catch (error) {
        copyBtn.textContent = "Kopyalama desteklenmedi";
        setTimeout(() => (copyBtn.textContent = "Bilgi Formatını Kopyala"), 1800);
      }
    });
  }

  if (!form || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.className = "form-message";
    message.textContent = "Başvuru gönderiliyor...";

    const formData = new FormData(form);
    const payload = {
      ad_soyad: String(formData.get("ad_soyad") || "").trim(),
      sinif: String(formData.get("sinif") || "").trim(),
      okul_no: String(formData.get("okul_no") || "").trim(),
      lichess_kullanici_adi: String(formData.get("lichess_kullanici_adi") || "").trim(),
      not: String(formData.get("not") || "").trim()
    };

    try {
      saveLocalApplication(payload);

      // Netlify üzerinde yayınlandığında başvuruyu Netlify Forms'a gönderir.
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(form)
      });

      message.className = "form-message success";
      message.innerHTML = "Başvurunuz alındı. Şimdi Lichess takım sayfasına gidip takıma katılma isteği gönderiniz.";
      form.reset();
      showLichessNextStep();
    } catch (error) {
      message.className = "form-message warn";
      message.textContent = "Başvuru bu tarayıcıda kaydedildi. Netlify'da yayınlandıktan sonra merkezi form kaydı da çalışacaktır.";
      showLichessNextStep();
    }
  });
}

function showLichessNextStep() {
  const form = document.getElementById("applicationForm");
  if (!form || document.getElementById("nextStepBox")) return;
  const box = document.createElement("div");
  box.id = "nextStepBox";
  box.className = "form-submitted-box";
  box.innerHTML = `
    <strong>Son adım:</strong>
    Lichess takım sayfasına gidip <b>Takıma Katıl</b> isteği gönderiniz.
    Açıklama bölümüne Ad Soyad, Sınıf, Okul No ve Lichess Kullanıcı Adı bilgilerinizi yazınız.
    <br><br>
    <a class="btn btn-primary full" href="${CONFIG.teamUrl}" target="_blank" rel="noopener">Lichess Takımına Git</a>
  `;
  form.appendChild(box);
}

setupApplicationForm();

// ------------------------------------------------------------
// Gelişmiş sonuç sistemi: JSON okuma + sekmeler + PDF sertifika
// ------------------------------------------------------------
const FALLBACK_RESULTS = {
  activeTournamentId: "2026-04-10-deneme",
  tournaments: [
    {
      id: "2026-04-10-deneme",
      title: "Okul İçi Online Satranç Deneme Turnuvası",
      dateLabel: "10 NİSAN",
      tempo: "Arena / Hızlı Satranç",
      status: "completed",
      players: [
        { rank: 1, username: "Paylanco", fullName: "", className: "", points: 3, tieBreak: 4, performance: 1564, wins: 3, draws: 0, losses: 1 },
        { rank: 2, username: "EmirAli35", fullName: "", className: "", points: 2, tieBreak: 1, performance: 1010, wins: 2, draws: 0, losses: 1 },
        { rank: 3, username: "dorukasilkaragull", fullName: "", className: "", points: 2, tieBreak: 0.5, performance: 908, wins: 2, draws: 0, losses: 1 },
        { rank: 4, username: "Kuzeyoko", fullName: "", className: "", points: 1, tieBreak: 1, performance: 715, wins: 1, draws: 0, losses: 1 },
        { rank: 5, username: "bushra_3", fullName: "", className: "", points: 0, tieBreak: 0, performance: 864, wins: 0, draws: 0, losses: 3 }
      ]
    }
  ]
};

let RESULTS_STATE = FALLBACK_RESULTS;
let ACTIVE_TOURNAMENT = FALLBACK_RESULTS.tournaments[0];

function sortPlayers(players) {
  return [...(players || [])].sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999));
}

function getInitials(player) {
  const source = (player.fullName || player.username || "?").trim();
  return source.split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

function trophySrc(rank) {
  if (Number(rank) === 1) return "assets/trophy-gold.svg";
  if (Number(rank) === 2) return "assets/trophy-silver.svg";
  return "assets/trophy-bronze.svg";
}

function labelForRank(rank) {
  if (Number(rank) === 1) return "1.";
  if (Number(rank) === 2) return "2.";
  if (Number(rank) === 3) return "3.";
  return `${rank}.`;
}

async function loadResultsFromJson() {
  try {
    const response = await fetch(`data/results.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("results.json okunamadı");
    const data = await response.json();
    if (!data || !Array.isArray(data.tournaments)) throw new Error("results.json biçimi hatalı");
    RESULTS_STATE = data;
  } catch (error) {
    RESULTS_STATE = FALLBACK_RESULTS;
  }

  ACTIVE_TOURNAMENT = RESULTS_STATE.tournaments.find(t => t.id === RESULTS_STATE.activeTournamentId) || RESULTS_STATE.tournaments[0] || FALLBACK_RESULTS.tournaments[0];
  renderAdvancedResults();
}

function renderAdvancedResults() {
  const dateLabel = document.getElementById("resultDateLabel");
  const titleLabel = document.getElementById("resultTitleLabel");
  const metaLabel = document.getElementById("resultMetaLabel");
  const winnerStage = document.getElementById("winnerStage");
  const standingsBody = document.getElementById("standingsTableBody");
  const standingsRange = document.getElementById("standingsRange");
  const archiveGrid = document.getElementById("archiveGrid");

  if (!winnerStage || !standingsBody) return;

  const players = sortPlayers(ACTIVE_TOURNAMENT.players);
  const podiumOrder = [2, 1, 3];
  const podiumPlayers = podiumOrder.map(rank => players.find(p => Number(p.rank) === rank)).filter(Boolean);

  if (dateLabel) dateLabel.textContent = ACTIVE_TOURNAMENT.dateLabel || "TARİH YAKINDA";
  if (titleLabel) titleLabel.textContent = ACTIVE_TOURNAMENT.title || "Turnuva sonuçları";
  if (metaLabel) metaLabel.textContent = `${ACTIVE_TOURNAMENT.tempo || "Tempo bilgisi yok"} • ${players.length} oyuncu`;
  if (standingsRange) standingsRange.textContent = players.length ? `1-${players.length} / ${players.length}` : "0-0 / 0";

  if (podiumPlayers.length) {
    winnerStage.innerHTML = podiumPlayers.map(player => `
      <article class="winner-card ${Number(player.rank) === 1 ? "first" : ""}">
        <div class="winner-trophy-wrap">
          <img class="winner-trophy" src="${trophySrc(player.rank)}" alt="${labelForRank(player.rank)} kupa" />
        </div>
        <div class="winner-name">${player.username || "Yakında"}</div>
        <div class="winner-stats">
          <div><span>Puanlar</span><strong>${player.points ?? "-"}</strong></div>
          <div><span>Beraberlik Kırıcı</span><strong>${player.tieBreak ?? "-"}</strong></div>
          <div><span>Performans</span><strong>${player.performance ?? "-"}</strong></div>
        </div>
      </article>
    `).join("");
  } else {
    winnerStage.innerHTML = `
      <article class="winner-card second"><div class="winner-trophy-wrap"><img class="winner-trophy" src="assets/trophy-silver.svg" alt="2. kupa" /></div><div class="winner-name">Yakında</div></article>
      <article class="winner-card first"><div class="winner-trophy-wrap"><img class="winner-trophy" src="assets/trophy-gold.svg" alt="1. kupa" /></div><div class="winner-name">Yakında</div></article>
      <article class="winner-card third"><div class="winner-trophy-wrap"><img class="winner-trophy" src="assets/trophy-bronze.svg" alt="3. kupa" /></div><div class="winner-name">Yakında</div></article>
    `;
  }

  standingsBody.innerHTML = players.length ? players.map(player => `
    <tr>
      <td><span class="rank-pill r${Number(player.rank) <= 3 ? Number(player.rank) : ""}">${player.rank}</span></td>
      <td class="player-cell">${player.username || "-"}<span class="perf-small">${player.performance || ""}</span></td>
      <td>${player.performance ?? "-"}</td>
      <td class="score-win">${player.wins ?? 0}</td>
      <td class="score-draw">${player.draws ?? 0}</td>
      <td class="score-loss">${player.losses ?? 0}</td>
      <td><strong>${player.points ?? 0}</strong></td>
      <td>${player.tieBreak ?? 0}</td>
      <td><button class="pdf-mini-btn" type="button" data-cert-user="${player.username}">PDF</button></td>
    </tr>
  `).join("") : `<tr><td colspan="9">Sonuçlar turnuva tamamlandıktan sonra yayınlanacaktır.</td></tr>`;

  renderWinnerAnnouncement(players);
  renderCertificateSelect(players);
  renderCertificatePreview(players[0]);

  if (archiveGrid) {
    archiveGrid.innerHTML = (RESULTS_STATE.tournaments || []).map(tournament => {
      const tPlayers = sortPlayers(tournament.players || []);
      const topThree = tPlayers.slice(0, 3);
      return `
        <article class="archive-card">
          <h3>${tournament.dateLabel || "Tarih yok"}</h3>
          <p>${tournament.title || "Turnuva"} • ${tournament.tempo || "Tempo yok"}</p>
          ${topThree.length ? `<ol>${topThree.map(p => `<li><strong>${p.rank}.</strong> ${p.username} — ${p.points} puan</li>`).join("")}</ol>` : `<p>Sonuçlar yakında.</p>`}
        </article>
      `;
    }).join("");
  }
}

function renderWinnerAnnouncement(players) {
  const container = document.getElementById("winnerAnnouncement");
  if (!container) return;
  const topThree = sortPlayers(players).slice(0, 3);
  if (!topThree.length) {
    container.innerHTML = `
      <div class="announcement-head"><h3>Okul Duyurusu</h3><img src="assets/okul-amblemi.png" alt="Okul amblemi"></div>
      <p>Turnuva tamamlandıktan sonra ilk üç derece öğrencileri burada duyuru kartı olarak yayınlanacaktır.</p>
    `;
    return;
  }
  container.innerHTML = `
    <div class="announcement-head">
      <h3>İlk Üç Derece</h3>
      <img src="assets/okul-amblemi.png" alt="Okul amblemi">
    </div>
    <div class="photo-winners">
      ${topThree.map(player => `
        <article class="photo-card">
          <div class="photo-avatar">${getInitials(player)}</div>
          <strong>${player.username}</strong>
          <span>${labelForRank(player.rank)} • ${player.points} puan • Performans ${player.performance}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCertificateSelect(players) {
  const select = document.getElementById("certificatePlayerSelect");
  if (!select) return;
  select.innerHTML = sortPlayers(players).map(player => `
    <option value="${player.username}">${player.rank}. ${player.username} - ${player.points} puan</option>
  `).join("");
}

function renderCertificatePreview(player) {
  const preview = document.getElementById("certificatePreview");
  if (!preview) return;
  if (!player) {
    preview.innerHTML = `<div class="certificate-inner"><p>Turnuva sonucu girildiğinde sertifika önizlemesi burada görünecek.</p></div>`;
    return;
  }
  const displayName = player.fullName ? `${player.fullName} (${player.username})` : player.username;
  preview.innerHTML = `
    <div class="certificate-inner">
      <img src="assets/okul-amblemi.png" alt="Okul amblemi" />
      <p class="certificate-kicker">Bozyaka Şehit Fethi Bey Anadolu Lisesi</p>
      <h2 class="certificate-title">Başarı Sertifikası</h2>
      <div class="certificate-player">${displayName}</div>
      <p class="certificate-text">
        Okulumuz Satranç Kulübü tarafından düzenlenen <strong>${ACTIVE_TOURNAMENT.title}</strong> etkinliğinde
        <strong>${labelForRank(player.rank)}</strong> olarak dereceye girmiştir. Öğrencimizi stratejik düşünme,
        sportmenlik ve çevrim içi turnuva katılım başarısından dolayı tebrik ederiz.
      </p>
      <div class="certificate-stats">
        <span>${ACTIVE_TOURNAMENT.dateLabel}</span>
        <span>${player.points} Puan</span>
        <span>Performans ${player.performance}</span>
        <span>Beraberlik Kırıcı ${player.tieBreak}</span>
      </div>
      <div class="certificate-sign">
        <div>Satranç Kulübü Danışmanı</div>
        <div>Okul Müdürlüğü</div>
      </div>
    </div>
  `;
}

function setupResultTabs() {
  const tabs = document.querySelectorAll(".result-tab");
  const panels = {
    latest: document.getElementById("latestPanel"),
    archive: document.getElementById("archivePanel"),
    certificate: document.getElementById("certificatePanel")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      Object.values(panels).forEach(panel => panel && panel.classList.remove("active"));
      tab.classList.add("active");
      const panel = panels[tab.dataset.tab];
      if (panel) panel.classList.add("active");
    });
  });
}

function printElementAsPdf(element, title) {
  if (!element) return;
  const previousTitle = document.title;
  document.title = title || previousTitle;
  element.classList.add("print-area");
  window.print();
  setTimeout(() => {
    element.classList.remove("print-area");
    document.title = previousTitle;
  }, 500);
}

function setupResultActions() {
  const refreshBtn = document.getElementById("refreshResultsBtn");
  const printAnnouncementBtn = document.getElementById("printAnnouncementBtn");
  const printCertificateBtn = document.getElementById("printCertificateBtn");
  const select = document.getElementById("certificatePlayerSelect");

  if (refreshBtn) refreshBtn.addEventListener("click", loadResultsFromJson);
  if (printAnnouncementBtn) {
    printAnnouncementBtn.addEventListener("click", () => printElementAsPdf(document.getElementById("winnerAnnouncement"), "İlk 3 Duyuru PDF"));
  }
  if (printCertificateBtn) {
    printCertificateBtn.addEventListener("click", () => printElementAsPdf(document.getElementById("certificatePreview"), "Satranç Sertifikası PDF"));
  }
  if (select) {
    select.addEventListener("change", () => {
      const players = sortPlayers(ACTIVE_TOURNAMENT.players);
      const player = players.find(p => p.username === select.value);
      renderCertificatePreview(player);
    });
  }

  document.addEventListener("click", event => {
    const btn = event.target.closest("[data-cert-user]");
    if (!btn) return;
    const user = btn.getAttribute("data-cert-user");
    const players = sortPlayers(ACTIVE_TOURNAMENT.players);
    const player = players.find(p => p.username === user);
    renderCertificatePreview(player);
    const certificateTab = document.querySelector('.result-tab[data-tab="certificate"]');
    if (certificateTab) certificateTab.click();
    if (select) select.value = user;
    setTimeout(() => printElementAsPdf(document.getElementById("certificatePreview"), `${user} Satranç Sertifikası`), 250);
  });
}

setupResultTabs();
setupResultActions();
loadResultsFromJson();
