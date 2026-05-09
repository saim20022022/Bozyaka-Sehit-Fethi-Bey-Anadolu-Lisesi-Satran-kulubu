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
    const turnuva = cleanText(data.turnuva);
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

    sheet.appendRow([
      tarih,
      turnuva,
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
  const approvedFromManualSheet = readApprovedSheet(spreadsheet);

  // Eğer Onaylananlar sekmesinde veri varsa asıl kontrol orasıdır.
  // Böylece manuel olarak onay verdiğin öğrencileri sadece bu sekmede tutabilirsin.
  if (approvedFromManualSheet.length > 0) {
    return uniqueParticipants(approvedFromManualSheet);
  }

  // Onaylananlar sekmesi boşsa Başvurular sekmesinden okur.
  // Eğer Başvurular'da "Onay Durumu" sütunu varsa sadece ONAYLANDI/KABUL/EVET/TAMAM yazanlar görünür.
  // Eğer bu sütun yoksa, mevcut sistemle uyumlu olmak için Başvurular'daki tüm kayıtlar görünür.
  return uniqueParticipants(readApplicationsSheet(spreadsheet));
}

function readApprovedSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(APPROVED_SHEET_NAME);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(normalizeHeader);

  return values.slice(1)
    .map(function(row) {
      return {
        adSoyad: getByHeaderOrIndex(row, headers, ["adsoyad", "ad", "ogrenci"], 0),
        sinif: getByHeaderOrIndex(row, headers, ["sinif", "sınıf"], 1),
        okulNo: getByHeaderOrIndex(row, headers, ["okulno", "no", "ogrencino"], 2),
        kullaniciAdi: getByHeaderOrIndex(row, headers, ["lichesskullaniciadi", "kullaniciadi", "username", "lichess"], 3)
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

  const headers = values[0].map(normalizeHeader);
  const approvalIndex = findHeaderIndex(headers, ["onaydurumu", "durum", "onay", "katilimdurumu", "katılımdurumu"]);

  return values.slice(1)
    .filter(function(row) {
      if (approvalIndex === -1) return true;
      return isApprovedValue(row[approvalIndex]);
    })
    .map(function(row) {
      return {
        // Başvurular sekmesinde mevcut sistemin doğru kolon sırası:
        // Tarih | Turnuva | Ad Soyad | Sınıf | Okul No | Lichess | Telefon | Açıklama | ...
        adSoyad: getByHeaderOrIndex(row, headers, ["adsoyad", "ad", "ogrenci"], 2),
        sinif: getByHeaderOrIndex(row, headers, ["sinif", "sınıf"], 3),
        okulNo: getByHeaderOrIndex(row, headers, ["okulno", "no", "ogrencino"], 4),
        kullaniciAdi: getByHeaderOrIndex(row, headers, ["lichesskullaniciadi", "kullaniciadi", "username", "lichess"], 5)
      };
    })
    .filter(isValidParticipant)
    .map(cleanParticipant);
}

function getByHeaderOrIndex(row, headers, acceptedHeaders, fallbackIndex) {
  const index = findHeaderIndex(headers, acceptedHeaders);
  const value = index >= 0 ? row[index] : row[fallbackIndex];
  return cleanText(value);
}

function findHeaderIndex(headers, acceptedHeaders) {
  for (let i = 0; i < headers.length; i++) {
    if (acceptedHeaders.indexOf(headers[i]) !== -1) {
      return i;
    }
  }
  return -1;
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

function isApprovedValue(value) {
  const text = normalizeHeader(value);
  return ["onaylandi", "onay", "evet", "kabul", "tamam", "ok", "true", "1"].indexOf(text) !== -1;
}

function isValidParticipant(item) {
  return item && item.adSoyad && item.sinif && item.kullaniciAdi;
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
    const key = normalizeHeader(clean.kullaniciAdi + "_" + clean.okulNo + "_" + clean.adSoyad);
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
