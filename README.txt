Bozyaka Satranç Turnuvası - CSV Onaylı Liste Final

Bu sürümde:
- Başvuru formu mevcut Apps Script URL ile Google Sheets'e kayıt gönderir.
- Form gönderildikten sonra aynı sekmede Lichess takım sayfası açılır.
- Katılımı Onaylananlar listesi Apps Script'ten değil, Google Sheets'te Web'de yayınlanan Onaylananlar CSV linkinden okunur.
- Apps Script dağıtımıyla uğraşmaya gerek yoktur.

Onaylananlar sekmesi düzeni:
A1: Ad Soyad
B1: Sınıf
C1: Okul No
D1: Lichess Kullanıcı Adı

Yeni öğrenciyi onaylayınca sadece Onaylananlar sekmesine ekle.
Google Sheets'te otomatik yeniden yayınla işaretli olduğu için site kısa süre sonra güncellenir.

CSV linki script.js içinde CONFIG.approvedCsvUrl alanındadır.
