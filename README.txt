Bozyaka Satranç Turnuvası - Kesin Kontrol Sürümü

Bu sürümde:
- Başvuru formu mevcut Apps Script URL'si ile Google Sheets'e kayıt gönderir.
- Form gönderildikten sonra aynı sekmede Lichess takım sayfasına yönlendirir.
- Katılımı Onaylananlar listesi Onaylananlar sekmesinden okunur.
- Tek bir CSV linkine mahkum değildir. Aşağıdaki kaynaklar otomatik denenir:
  1) Google Visualization JSONP bağlantısı
  2) Orijinal Sheet ID üzerinden yayın CSV bağlantısı
  3) Orijinal Sheet ID üzerinden export CSV bağlantısı
  4) Web'de yayınla penceresindeki CSV linkinin 0/O ihtimalleri
- Eğer Google bağlantısı o an kurulamazsa, eldeki 5 kişilik yedek liste gösterilir.

Google Sheets Onaylananlar sekmesi düzeni:
A: Ad Soyad
B: Sınıf
C: Okul No
D: Lichess Kullanıcı Adı

Apps Script'e dokunmayın. Site dosyalarını GitHub'a yüklemek yeterlidir.
