Bozyaka ŞFBA 19 Mayıs Online Satranç Turnuvası

Bu sürümde:
- Başvuru formu var.
- Başvurular Google Sheets'e gider.
- Lichess takım sayfası açılır.
- Katılımı onaylananlar listesi var.
- Turnuva sıralaması tablosu var.
- Yönetici / Google Sheets butonu yoktur.

Onaylananları düzenleme:
data/onaylananlar.json

Örnek:
[
  { "adSoyad": "Ali Veli", "sinif": "9-A", "kullaniciAdi": "aliveli35" }
]

Sıralamayı düzenleme:
data/siralama.json

Örnek:
[
  { "sira": 1, "adSoyad": "Ali Veli", "sinif": "9-A", "kullaniciAdi": "aliveli35", "puan": "5", "durum": "Devam ediyor" }
]

Apps Script daha önce güncellendiyse tekrar dokunmaya gerek yoktur.


POP-UP DUZELTMESI:
Bu surumde basvuru sonrasi Lichess takim sayfasi yeni pencere olarak acilmaz.
Pop-up engelleyiciye takilmamasi icin ayni sekmede yonlendirme yapilir.


ONAYLANANLAR LİSTESİ
Katılımı onaylanan öğrenciler data/onaylananlar.json dosyasından gelir.
Yeni onay verdikçe aynı formata göre yeni kayıt ekleyin:
{
  "adSoyad": "Öğrenci Adı",
  "sinif": "10-A",
  "okulNo": "123",
  "kullaniciAdi": "lichessadi"
}
