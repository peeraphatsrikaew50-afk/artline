/**
 * API Service Component
 * จัดการการเชื่อมต่อและรับส่งข้อมูลระหว่างหน้าเว็บกับ Google Apps Script
 */

const apiService = {
  // ฟังก์ชันสเปกกลางสำหรับรองรับการเรียกใช้แบบ .request()
  async request(action, payload = null) {
    try {
      if (payload) {
        // กรณีส่งข้อมูลแบบ POST (อัปโหลดรูปภาพ)
        const response = await fetch(CONFIG.SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8", // เลี่ยงปัญหา CORS
          },
          body: JSON.stringify({
            action: action,
            payload: payload
          })
        });
        return await response.json();
      } else {
        // กรณีดึงข้อมูลแบบ GET
        const response = await fetch(`${CONFIG.SCRIPT_URL}?action=${action}`);
        return await response.json();
      }
    } catch (error) {
      console.error(`API Request Error (${action}):`, error);
      throw error;
    }
  },

  // ดึงรายการภาพวาดทั้งหมดจาก Google Sheets
  async getArtworks() {
    return await this.request("getArtworks");
  },

  // อัปโหลดภาพวาดใหม่เข้า Google Drive
  async uploadArtwork(payload) {
    return await this.request("uploadArtwork", payload);
  }
};

// ประกาศ Alias ป้องกันไฟล์อื่นเรียกใช้ตัวแปรชื่อ API แบบตัวพิมพ์ใหญ่
const API = apiService;
