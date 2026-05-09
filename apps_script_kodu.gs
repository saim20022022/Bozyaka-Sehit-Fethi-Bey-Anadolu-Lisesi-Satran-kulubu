const SHEET_ID = "1NzjcxucHhzUdgRBO7uzQXiykm9BiHHvLtZRod80gGvI";
const SHEET_NAME = "Başvurular";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createResponse({
        success: false,
        message: "Başvurular sayfası bulunamadı. Google Sheets altındaki sayfa adı Başvurular olmalı."
      });
    }

    const data = parseRequestData(e);

    const tarih = new Date();
    const turnuva = cleanText(data.turnuva);
    const adSoyad = cleanText(data.ad_soyad || data.adSoyad);
    const sinif = cleanText(data.sinif);
    const okulNo = cleanText(data.okul_no || data.okulNo);
    const lichess = cleanText(data.lichess_kullanici_adi || data.lichess);
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

    return createResponse({
      success: true,
      message: "Başvuru başarıyla kaydedildi."
    });

  } catch (error) {
    return createResponse({
      success: false,
      message: "Kayıt sırasında hata oluştu: " + error.message
    });
  }
}

function doGet() {
  return createResponse({
    success: true,
    message: "Bozyaka Satranç Başvuru Sistemi aktif."
  });
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
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/</g, "")
    .replace(/>/g, "");
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
