BOZYAKA ONLINE SATRANÇ TURNUVASI - NETLIFY SAYFASI

1) Dosyaları GitHub reposuna yükleyin.
2) Netlify > Add new site > Import from GitHub ile yayınlayın.
3) Turnuva linki ve tarih hazır olunca script.js dosyasındaki CONFIG alanını düzenleyin:

  tournamentUrl: "LICHESS_TURNUVA_LINKI",
  tournamentDate: "2026-05-20T20:00:00+03:00",
  tournamentDateLabel: "20 Mayıs 2026 Çarşamba, 20.00"

4) MEB okul sitesinde duyuru/kısayol olarak Netlify linkini paylaşın.

Mevcut Lichess takım linki:
https://lichess.org/team/bozyaka-sfbal-satranc-kulubu


YENİ EKLENEN: WEB BAŞVURU FORMU
--------------------------------
Sayfaya 'Turnuva Başvuru Formu' bölümü eklendi.
Öğrenciler şu bilgileri girer:
- Ad Soyad
- Sınıf
- Okul No
- Lichess Kullanıcı Adı
- Not / Açıklama
- Kuralları kabul onayı

Netlify'da yayınlandığında form gönderimleri Netlify Forms bölümüne düşer.
Netlify panelinden Site > Forms bölümünden başvurular görülebilir ve CSV indirilebilir.

Önemli: Bu form Lichess takımına otomatik üye yapmaz. Öğrenci formdan sonra Lichess takım sayfasına gidip ayrıca 'Takıma Katıl' isteği göndermelidir.

GELİŞMİŞ SONUÇ MODÜLÜ
---------------------
Bu sürümde Sonuçlar bölümü geliştirildi:
- Gerçek kupa SVG tasarımı
- Lichess tarzına yakın derece tablosu
- Son Turnuva / Önceki Turnuvalar / PDF Sertifika sekmeleri
- İlk 3 derece için okul duyurusu görünümü
- Öğrenci bazlı PDF sertifika alma
- Sonuçları data/results.json dosyasından otomatik okuma

SONUÇ GÜNCELLEME
----------------
Turnuva bitince data/results.json dosyasını açıp oyuncu listesini düzenle.
Örnek alanlar:
rank, username, fullName, className, points, tieBreak, performance, wins, draws, losses

PDF ALMA
--------
Sayfadaki "İlk 3 Duyuru PDF" veya sertifika bölümündeki "Sertifikayı PDF Al" butonu tarayıcı yazdırma ekranını açar.
Hedef olarak "PDF olarak kaydet" seçilir.


19 MAYIS TURNUVA SERİSİ NOTLARI
------------------------------
- Turnuva adı: 19 Mayıs Gençlik ve Spor Bayramı Satranç Turnuvası
- Tarihler: 11, 12, 13, 14, 15, 16, 17, 18, 19 Mayıs
- Başlangıç saati: Her gün 20.00
- Sistem: İsviçre sistemi
- Tempo: 5+3
- Genel sonuç: Tüm turnuvalardan alınan toplam puana göre belirlenir.
- Ödüller: 1. 1000 TL, 2. 750 TL, 3. 500 TL
- Tüm katılımcılara sertifika verilecektir.

Günlük turnuva linkleri oluşturuldukça index.html içinde program bölümüne veya duyuru panosuna eklenebilir.
Sonuçlar data/results.json dosyasına girildiğinde web sayfası otomatik okur.
