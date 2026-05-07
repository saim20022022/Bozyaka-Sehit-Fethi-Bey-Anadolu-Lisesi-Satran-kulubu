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
