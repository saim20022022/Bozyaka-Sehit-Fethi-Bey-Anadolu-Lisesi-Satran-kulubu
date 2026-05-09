BOZYAKA ŞFBA 19 MAYIS SATRANÇ TURNUVASI - SHEETS OKUYAN FINAL

Bu sürümde:
- Başvuru formu Google Sheets'e kayıt gönderir.
- Başvuru başarıyla gönderildikten sonra aynı sekmede Lichess takım sayfası açılır.
- Katılımı Onaylananlar listesi artık data/onaylananlar.json dosyasından DEĞİL Google Sheets'ten canlı okunur.
- Google Sheets'e webden gelen kayıtlar da, elle yazılan kayıtlar da webde görünür.
- Zorunlu alanlar: Ad Soyad, Sınıf, Okul No, Lichess Kullanıcı Adı.
- Telefon ve Açıklama isteğe bağlıdır.
- Yönetici/Sheets butonu yoktur.
- Gereksiz Lichess/Takım/Turnuva butonları yoktur.

Google Sheets sütun düzeni:
A: Tarih
B: Ad Soyad
C: Sınıf
D: Okul No
E: Lichess Kullanıcı Adı
F: Telefon
G: Açıklama
H: Kuralları Kabul
I: Kaynak
J: User Agent

Elle kayıt eklerken B, C, D, E sütunlarını doldurman yeterlidir.
Webde sadece şu bilgiler gösterilir:
Ad Soyad | Sınıf | Okul No | Lichess Kullanıcı Adı

ÖNEMLİ:
Webin Sheets'ten kayıt okuyabilmesi için apps_script_kodu.gs içeriği Google Apps Script'e bir kez yapıştırılıp mevcut dağıtımda YENİ SÜRÜM olarak dağıtılmalıdır.
URL değişmez.
