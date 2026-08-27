/**
 * API Service Component
 * จัดการการเชื่อมต่อและรับส่งข้อมูลระหว่างหน้าเว็บกับ Google Apps Script
 */

const apiService = {
  // ฟังก์ชันสเปกกลางสำหรับเรียก API ทั่วไป (แก้ปัญหา apiService.request is not a function)
  async request(action, payload = null) {
    try {
      if (payload) {
        // กรณีส่งข้อมูลแบบ POST
        const response = await fetch(CONFIG.SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
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

  // ดึงรายการภาพวาดทั้งหมด
  async getArtworks() {
    return await this.request("getArtworks");
  },

  // อัปโหลดภาพวาดใหม่
  async uploadArtwork(payload) {
    return await this.request("uploadArtwork", payload);
  }
};

// ประกาศ Alias ตัวแปรเพื่อรองรับการเรียกใช้แบบตัวพิมพ์ใหญ่
const API = apiService;
