# คู่มือขั้นตอนการติดตั้งและการ Deploy ระบบ Online Artwork (Setup & Deployment Guide)

เอกสารนี้ระบุขั้นตอนการนำโค้ดสคริปต์ Google Apps Script (GAS) ไปติดตั้ง และการ Deploy Web Application สำหรับระบบ Online Artwork

---

## 1. ขั้นตอนการตั้งค่าฝั่ง Google Apps Script (Backend & Database Setup)

### ขั้นตอนที่ 1.1: เปิด Google Apps Script Editor
1. เปิดเบราว์เซอร์ไปที่ Google Spreadsheet ของคุณ:
   [Google Sheet Link](https://docs.google.com/spreadsheets/d/16naknRybSVZ0bhN0XjQNuF4Xzzr3n8_jaclh9CtNG94/edit)
2. ไปที่เมนู **ส่วนขยาย (Extensions)** -> **Apps Script**

### ขั้นตอนที่ 1.2: คัดลอกโค้ดสคริปต์ลงในโปรเจกต์
ในแถบเมนูด้านซ้ายของ Apps Script Editor ให้สร้างไฟล์ `.gs` ทั้งหมด 4 ไฟล์ และคัดลอกโค้ดจากโฟลเดอร์ [`gas/`](file:///d:/msr_artonline/gas) ไปวางตามชื่อไฟล์:

1. **`Setup.gs`** (คัดลอกเนื้อหาจาก [`d:\msr_artonline\gas\Setup.gs`](file:///d:/msr_artonline/gas/Setup.gs))
2. **`Code.gs`** (คัดลอกเนื้อหาจาก [`d:\msr_artonline\gas\Code.gs`](file:///d:/msr_artonline/gas/Code.gs))
3. **`SheetService.gs`** (คัดลอกเนื้อหาจาก [`d:\msr_artonline\gas\SheetService.gs`](file:///d:/msr_artonline/gas/SheetService.gs))
4. **`DriveService.gs`** (คัดลอกเนื้อหาจาก [`d:\msr_artonline\gas\DriveService.gs`](file:///d:/msr_artonline/gas/DriveService.gs))

### ขั้นตอนที่ 1.3: รันฟังก์ชัน `setupDatabase()` เพื่อสร้างฐานข้อมูลและโฟลเดอร์อัตโนมัติ
1. ที่แถบเครื่องมือด้านบน เลือกฟังก์ชัน **`setupDatabase`**
2. กดปุ่ม **เรียกใช้ (Run)**
3. ในการรันครั้งแรก ระบบ Google จะขออนุญาตเข้าถึงสิทธิ์ (Authorization Required):
   - กด **ตรวจทานสิทธิ์ (Review Permissions)**
   - เลือกบัญชี Google ของคุณ
   - กด **ขั้นสูง (Advanced)** -> กด **ไปที่ โปรเจกต์ที่ไม่ได้สแกน (Unsafe)**
   - กด **อนุญาต (Allow)**
4. สคริปต์จะทำการเนรมิต 9 Sheets บน Google Sheets พร้อมจัดฟอร์แมต Header Row สี `#1E293B` ตัวหนังสือสีขาว ใส่ Dropdown Validations และสร้างโฟลเดอร์ย่อยใน Google Drive อัตโนมัติ!

---

## 2. ขั้นตอนการ Deploy เป็น Web App (Deploying as Web App)

1. ในหน้า Apps Script Editor ให้มองหาปุ่ม **ทำให้ใช้งานได้ (Deploy)** สีน้ำเงินที่มุมขวาบน
2. เลือก **การทำให้ใช้งานได้ใหม่ (New deployment)**
3. กดรูปเฟืองเลือกประเภทเป็น **เว็บแอป (Web app)**
4. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `Online Artwork REST API v1.0`
   - **เรียกใช้ในฐานะ (Execute as):** `ฉัน (Me - บัญชีอีเมลของคุณ)` *(สำคัญมาก! เพื่อให้ใช้สิทธิ์ของคุณในการเขียน Sheet/Drive)*
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก! เพื่อให้ Web App ภายนอกเรียก API ได้โดยไม่ติด Authen Block)*
5. กด **ทำให้ใช้งานได้ (Deploy)**
6. คัดลอก **URL เว็บแอป (Web App URL)** ที่ได้ นำไปใส่ในไฟล์ [`src/js/config.js`](file:///d:/msr_artonline/src/js/config.js) ตรงตัวแปร `GAS_WEB_APP_URL`

---

## 3. ขั้นตอนการเปิดใช้งานฝั่ง Frontend (Web Application)

### วิธีที่ 1: เปิดใช้งานโดยตรงบนคอมพิวเตอร์ (Local Static Run)
1. เปิดไฟล์ [`d:\msr_artonline\index.html`](file:///d:/msr_artonline/index.html) ใน Google Chrome / Edge หรือเปิดผ่าน Live Server (VScode Extension)
2. หน้าเว็บจะโหลดแกลเลอรีภาพวาด ทำการสลับบทบาทสิทธิ์ (Guest, Member, Artist, Admin) เพื่อทดสอบการกดถูกใจ การคอมเมนต์ และการดู Analytics Dashboard

### วิธีที่ 2: โฮสต์บน Cloudflare Pages หรือ GitHub Pages (Zero-Cost Hosting)
1. อัปโหลดโฟลเดอร์โครงการขึ้น GitHub Repository
2. เชื่อมต่อ Repository เข้ากับ **Cloudflare Pages** หรือ **GitHub Pages**
3. เลือก Build Command เป็นค่าว่าง (Static HTML) และเลือก Root Directory เป็น `./`
4. หน้าเว็บของคุณจะพร้อมใช้งานระดับ Production ทั่วโลกทันที!

---

## 📁 โครงสร้างไฟล์ทั้งหมดของโครงการ (File Directory Summary)

```text
d:/msr_artonline/
├── index.html                  # Main SPA Layout
├── setup_guide.md              # คู่มือติดตั้งและ Deploy
├── implementation_plan.md      # เอกสารแผนการพัฒนาระบบ
├── daily_work_log_2026-08-10.md# บันทึกกิจกรรมการทำงาน
├── .env.example                # ค่าคอนฟิกตัวอย่าง
├── gas/                        # Google Apps Script Source Files
│   ├── Setup.gs
│   ├── Code.gs
│   ├── SheetService.gs
│   └── DriveService.gs
└── src/
    ├── css/
    │   └── style.css           # Glassmorphism Design System CSS
    └── js/
        ├── config.js           # App Configurations
        ├── api.js              # GAS REST API Service Client (Retry Logic)
        ├── auth.js             # User RBAC & Guest Session
        ├── app.js              # Main Controller & Navigation Router
        └── components/
            ├── gallery.js      # Gallery Grid & Filters Component
            ├── artworkModal.js # Lightbox Modal & Comments Component
            ├── uploadModal.js  # Drag-and-Drop Drive Upload Component
            └── dashboard.js   # Analytics Dashboard Component
```
