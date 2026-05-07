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
