BOZYAKA ŞFBA SATRANÇ TURNUVASI - SHEETS KONTROLLÜ ONAYLI LİSTE

Bu sürümde webdeki Katılımı Onaylananlar listesi artık sadece data/onaylananlar.json'a bağlı değildir.
Liste Google Sheets'ten canlı olarak okunur.

ÇALIŞMA MANTIĞI
1. Öğrenci web formundan başvurur.
2. Başvuru Google Sheets > Başvurular sayfasına düşer.
3. Web sitesi Katılımı Onaylananlar listesini Apps Script üzerinden Google Sheets'ten çeker.
4. Lichess'te onay verdiğin öğrenciler webde görünebilir.

EN KOLAY KULLANIM
A) Eğer tüm Başvurular sayfasındaki öğrenciler webde görünsün istiyorsan hiçbir şey yapma.
   Onaylananlar sekmesi yoksa veya boşsa, sistem Başvurular sayfasındaki kayıtları listeler.

B) Sadece onay verdiğin öğrenciler görünsün istiyorsan Google Sheets'te yeni bir sekme aç:
   Sekme adı: Onaylananlar
   Başlıklar: Ad Soyad | Sınıf | Okul No | Lichess Kullanıcı Adı
   Bu sekmeye kimi yazarsan webde sadece onlar görünür.

C) Alternatif olarak Başvurular sayfasına Onay Durumu sütunu ekleyebilirsin.
   Onay Durumu hücresine ONAYLANDI yazılanlar görünür.
   Kabul edilen değerler: ONAYLANDI, ONAY, EVET, KABUL, TAMAM, OK

ÖNEMLİ
Bu sürümde Apps Script kodu güncellendi.
Google Apps Script ekranında apps_script_kodu.gs içeriğini yapıştırıp mevcut dağıtımı Yeni Sürüm olarak dağıtmalısın.
URL değişmeyecek.

Web dosyalarını GitHub/Netlify'a yüklemen yeterlidir.
