const SHEET_ID = "1NzjcxucHhzUdgRBO7uzQXiykm9BiHHvLtZRod80gGvI";
const APPLICATION_SHEET_NAME = "Başvurular";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(APPLICATION_SHEET_NAME);

    if (!sheet) {
      return createResponse({ success: false, message: "Başvurular sayfası bulunamadı." });
    }

    ensureHeaders(sheet);

    const data = parseRequestData(e);

    const tarih = new Date();
    const adSoyad = cleanText(data.ad_soyad || data.adSoyad);
    const sinif = cleanText(data.sinif);
    const okulNo = cleanText(data.okul_no || data.okulNo);
    const lichess = cleanText(data.lichess_kullanici_adi || data.lichess || data.kullaniciAdi);
    const telefon = cleanText(data.telefon);
    const aciklama = cleanText(data.not || data.aciklama);
    const kurallarKabul = cleanText(data.kurallar_kabul);
    const kaynak = cleanText(data.kaynak);
    const userAgent = cleanText(data.user_agent);

    if (!adSoyad || !sinif || !okulNo || !lichess) {
      return createResponse({
        success: false,
        message: "Ad Soyad, Sınıf, Okul No ve Lichess kullanıcı adı zorunludur."
      });
    }

    // KESİN DÜZEN: Turnuva sütunu YOK.
    // A Tarih | B Ad Soyad | C Sınıf | D Okul No | E Lichess Kullanıcı Adı | F Telefon | G Açıklama | H Kuralları Kabul | I Kaynak | J User Agent
    sheet.appendRow([
      tarih,
      adSoyad,
      sinif,
      okulNo,
      lichess,
      telefon,
      aciklama,
      kurallarKabul,
      kaynak,
      userAgent
    ]);

    return createResponse({ success: true, message: "Başvuru başarıyla kaydedildi." });

  } catch (error) {
    return createResponse({ success: false, message: "Kayıt sırasında hata oluştu: " + error.message });
  }
}

function doGet(e) {
  try {
    const action = e && e.parameter ? cleanText(e.parameter.action) : "";
    const callback = e && e.parameter ? cleanCallbackName(e.parameter.callback) : "";

    if (action === "approved") {
      const payload = {
        success: true,
        approved: getParticipantsFromSheet()
      };
      return callback ? createJsonpResponse(callback, payload) : createResponse(payload);
    }

    const payload = {
      success: true,
      message: "Bozyaka Satranç Başvuru Sistemi aktif. Turnuva sütunu yok."
    };
    return callback ? createJsonpResponse(callback, payload) : createResponse(payload);

  } catch (error) {
    const payload = { success: false, message: "Liste okunamadı: " + error.message };
    const callback = e && e.parameter ? cleanCallbackName(e.parameter.callback) : "";
    return callback ? createJsonpResponse(callback, payload) : createResponse(payload);
  }
}

function getParticipantsFromSheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(APPLICATION_SHEET_NAME);
  if (!sheet) return [];

  ensureHeaders(sheet);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const participants = [];

  values.slice(1).forEach(function(row) {
    if (isEmptyRow(row)) return;

    // Doğru yeni düzen:
    // A Tarih | B Ad Soyad | C Sınıf | D Okul No | E Lichess Kullanıcı Adı
    let item = {
      adSoyad: row[1],
      sinif: row[2],
      okulNo: row[3],
      kullaniciAdi: row[4]
    };

    // Eski kaymış düzen desteği:
    // A Tarih | B Turnuva | C Ad Soyad | D Sınıf | E Okul No | F Lichess Kullanıcı Adı
    const b = cleanText(row[1]).toLocaleLowerCase("tr-TR");
    const bIsTurnuva = b.includes("turnuva") || b.includes("bozyaka") || b.includes("19 mayıs") || b.includes("satranç");

    if (bIsTurnuva) {
      item = {
        adSoyad: row[2],
        sinif: row[3],
        okulNo: row[4],
        kullaniciAdi: row[5]
      };
    }

    if (isValidParticipant(item)) {
      participants.push(cleanParticipant(item));
    }
  });

  return uniqueParticipants(participants);
}

function ensureHeaders(sheet) {
  const headers = [
    "Tarih",
    "Ad Soyad",
    "Sınıf",
    "Okul No",
    "Lichess Kullanıcı Adı",
    "Telefon",
    "Açıklama",
    "Kuralları Kabul",
    "Kaynak",
    "User Agent"
  ];

  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsFix = headers.some(function(header, index) {
    return cleanText(current[index]) !== header;
  });

  if (needsFix) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function isEmptyRow(row) {
  return !row || row.every(function(cell) { return !cleanText(cell); });
}

function isValidParticipant(item) {
  return item && cleanText(item.adSoyad) && cleanText(item.sinif) && cleanText(item.okulNo) && cleanText(item.kullaniciAdi);
}

function cleanParticipant(item) {
  return {
    adSoyad: cleanText(item.adSoyad),
    sinif: cleanText(item.sinif),
    okulNo: cleanText(item.okulNo),
    kullaniciAdi: cleanText(item.kullaniciAdi)
  };
}

function uniqueParticipants(list) {
  const seen = {};
  const result = [];

  list.forEach(function(item) {
    const clean = cleanParticipant(item);
    const key = normalize(clean.kullaniciAdi + "_" + clean.okulNo);
    if (!key || seen[key]) return;
    seen[key] = true;
    result.push(clean);
  });

  result.sort(function(a, b) {
    return a.adSoyad.localeCompare(b.adSoyad, "tr");
  });

  return result;
}

function parseRequestData(e) {
  if (!e) return {};

  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (jsonError) {
      return parseFormEncoded(e.postData.contents);
    }
  }

  return {};
}

function parseFormEncoded(text) {
  const result = {};
  if (!text) return result;

  text.split("&").forEach(function(part) {
    const pieces = part.split("=");
    const key = decodeURIComponent((pieces[0] || "").replace(/\+/g, " "));
    const value = decodeURIComponent((pieces.slice(1).join("=") || "").replace(/\+/g, " "));
    if (key) result[key] = value;
  });

  return result;
}

function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim().replace(/</g, "").replace(/>/g, "");
}

function normalize(value) {
  return cleanText(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

function cleanCallbackName(value) {
  const name = cleanText(value);
  if (!name) return "";
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : "";
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonpResponse(callback, data) {
  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
