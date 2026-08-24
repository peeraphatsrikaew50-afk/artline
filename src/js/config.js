/**
 * config.js - Global App Configuration & Endpoints
 * Online Artwork Platform v1.0
 * อัปเดต: 24 สิงหาคม 2026 — ใช้ค่าจาก MASTER PROMPT Configuration
 */

const CONFIG = {
  APP_NAME: "Online Artwork Platform",
  VERSION: "1.0.0",
  TIMEZONE: "UTC+7",
  LANGUAGE: "th",

  // ===== Google Apps Script (GAS) Backend API =====
  // GAS Deployment URL (Deployed: Execute as Me / Anyone can access)
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzhpb_5rBhQsPKQ3JYWzLJlLchZGhqsUbMfGyRU1iAqD0r73iy33h3d7bFJiPMYkXi4/exec",
  GAS_DEPLOYMENT_ID: "AKfycbzhpb_5rBhQsPKQ3JYWzLJlLchZGhqsUbMfGyRU1iAqD0r73iy33h3d7bFJiPMYkXi4",
  GAS_PROJECT_ID: "1w43O-UMmp0XpONt_gVvb3aMEVAOuOX9L9J88-ffjvI4RfZY8_xs629xU",

  // ===== Google Drive Storage =====
  DRIVE_FOLDER_ID: "1S2wyl9O0vb-SxsN0TUHhGJzOO1A-zDHD",
  DRIVE_FOLDER_NAME: "GAS_File",

  // ===== Supabase PostgreSQL Database =====
  // (ใช้สำหรับ Phase 2 — Supabase Integration)
  SUPABASE_URL: "https://ibenoolvfszmuttseyft.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_7ZYIeXyQ2hbSACy1u3TS_A_LS9Mpw9W",
  SUPABASE_PROJECT_ID: "ibenoolvfszmuttseyft",

  // ===== API Call Settings =====
  // จำนวนครั้งที่ลองใหม่อัตโนมัติเมื่อ GAS ไม่ตอบสนอง
  MAX_RETRIES: 3,
  // Timeout 20 วินาที (GAS อาจช้าในการ Cold Start)
  FETCH_TIMEOUT: 20000,
  // Retry Delay แบบ Exponential Backoff (ms)
  RETRY_BASE_DELAY: 1000,

  // ===== Security Settings =====
  // API Secret Key สำหรับป้องกัน Unauthorized Access
  // ⚠️ ในโปรดักชัน ให้เปลี่ยน Key นี้ และต้องตรงกับ GAS_API_SECRET ใน Code.gs
  API_SECRET_KEY: "oa_secret_2026_online_artwork",

  // ===== Feature Flags =====
  FEATURE_EARLY_ACCESS: true,      // เปิดระบบ Early Access สำหรับ Member
  FEATURE_GUEST_INTERACTION: true, // เปิดให้ Guest กด Like/Favorite ได้
  FEATURE_ANALYTICS: true,         // เปิด Dashboard Analytics
  FEATURE_DARK_MODE: true,         // เปิดระบบ Dark/Light Mode toggle

  // ===== Pagination =====
  DEFAULT_PAGE_SIZE: 12,           // จำนวน Artwork ต่อหน้า Gallery
  MAX_PAGE_SIZE: 50,

  // ===== Upload Limits =====
  MAX_FILE_SIZE_MB: 10,            // ขนาดไฟล์สูงสุดที่อัปโหลดได้ (MB)
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

// Freeze object เพื่อป้องกันการแก้ไขค่าจาก Browser Console (F12)
Object.freeze(CONFIG);
