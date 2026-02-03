# StajYonetim MVP

Meslek lisesi staj yönetim sistemi. .NET 8 Backend + React Frontend + PostgreSQL.

## Gereksinimler
- Docker & Docker Compose

## Kurulum ve Çalıştırma

1. Proje ana dizininde (bu dosyanın olduğu yer) terminali açın.
2. Aşağıdaki komutu çalıştırın:

```bash
docker-compose up --build
```

Bu komut:
- PostgreSQL veritabanını başlatır.
- Backend API'yi derler ve başlatır (Port 5000: http://localhost:5000/swagger).
- Frontend uygulamasını derler ve Nginx ile sunar (Port 3000: http://localhost:3000).

*Not: İlk çalıştırışta veritabanı oluşması ve seed verilerin yüklenmesi birkaç saniye sürebilir.*

## Giriş Bilgileri (Default Accounts)

Sistem açıldığında aşağıdaki hesaplarla giriş yapabilirsiniz:

- **Admin:** `admin@staj.com` / `123456`
- **Öğretmen:** `teacher1@staj.com` / `123456`
- **Öğrenci:** `student1@staj.com` / `123456`

## Proje Yapısı

- `/backend`: .NET 8 Web API
- `/frontend`: React + Vite + Tailwind + TypeScript
- `/docker`: Docker yapılandırmaları
- `docker-compose.yml`: Orkestrasyon

## Özellikler

- **Auth:** JWT Login (Admin, Teacher, Student, Company)
- **Students:** Listeleme, ISG Belgesi Yükleme
- **Companies:** Listeleme, Kontenjan takibi
- **Placements (Atama):**
  - İş kuralları kontrolü (Alan uyumu, tarih çakışması, kontenjan, belge zorunluluğu)
  - Admin/Teacher tarafından atama yapma
