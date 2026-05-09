const SHEET_ID = "1NzjcxucHhzUdgRBO7uzQXiykm9BiHHvLtZRod80gGvI";
const APPLICATION_SHEET_NAME = "Başvurular";
const APPROVED_SHEET_NAME = "Onaylananlar";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(APPLICATION_SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({
        success: false,
        message: "Başvurular sayfası bulunamadı."
      });
    }

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
      return createJsonResponse({
        success: false,
        message: "Ad Soyad, Sınıf, Okul No ve Lichess kullanıcı adı zorunludur."
      });
    }

    // Yeni düzen: Turnuva sütunu YOK.
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

    return createJsonResponse({
      success: true,
      message: "Başvuru başarıyla kaydedildi."
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: "Kayıt sırasında hata oluştu: " + error.message
    });
  }
}

function doGet(e) {
  const action = e && e.parameter ? cleanText(e.parameter.action) : "";
  const callback = e && e.parameter ? cleanCallbackName(e.parameter.callback) : "";

  if (action === "approved") {
    const payload = {
      success: true,
      approved: getApprovedParticipants()
    };

    if (callback) {
      return createJsonpResponse(callback, payload);
    }

    return createJsonResponse(payload);
  }

  const statusPayload = {
    success: true,
    message: "Bozyaka Satranç Başvuru Sistemi aktif."
  };

  if (callback) {
    return createJsonpResponse(callback, statusPayload);
  }

  return createJsonResponse(statusPayload);
}

function getApprovedParticipants() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);

  const manualApproved = readApprovedSheet(spreadsheet);
  const applications = readApplicationsSheet(spreadsheet);

  return uniqueParticipants(manualApproved.concat(applications));
}

function readApprovedSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(APPROVED_SHEET_NAME);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  return values.slice(1)
    .map(function(row) {
      return {
        adSoyad: row[0],
        sinif: row[1],
        okulNo: row[2],
        kullaniciAdi: row[3]
      };
    })
    .filter(isValidParticipant)
    .map(cleanParticipant);
}

function readApplicationsSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(APPLICATION_SHEET_NAME);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  return values.slice(1)
    .map(function(row) {
      // Yeni doğru düzen:
      // A Tarih | B Ad Soyad | C Sınıf | D Okul No | E Lichess Kullanıcı Adı
      let adSoyad = row[1];
      let sinif = row[2];
      let okulNo = row[3];
      let kullaniciAdi = row[4];

      // Eski hatalı düzen desteği:
      // A Tarih | B Turnuva | C Ad Soyad | D Sınıf | E Okul No | F Lichess Kullanıcı Adı
      // B sütununda turnuva adı varsa otomatik eski düzen olarak okur.
      const bCell = cleanText(row[1]).toLocaleLowerCase("tr-TR");
      const looksLikeOldTurnuvaColumn = bCell.includes("turnuva") || bCell.includes("bozyaka şfba");

      if (looksLikeOldTurnuvaColumn) {
        adSoyad = row[2];
        sinif = row[3];
        okulNo = row[4];
        kullaniciAdi = row[5];
      }

      return {
        adSoyad: adSoyad,
        sinif: sinif,
        okulNo: okulNo,
        kullaniciAdi: kullaniciAdi
      };
    })
    .filter(isValidParticipant)
    .map(cleanParticipant);
}

function isValidParticipant(item) {
  return item && cleanText(item.adSoyad) && cleanText(item.sinif) && cleanText(item.kullaniciAdi);
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
    const key = normalizeHeader(clean.kullaniciAdi + "_" + clean.okulNo);
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

function normalizeHeader(value) {
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
  const callback = cleanText(value);
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(callback)) {
    return callback;
  }
  return "";
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonpResponse(callback, data) {
  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
