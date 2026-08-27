/**
 * API Service Component
 * จัดการการเชื่อมต่อและรับส่งข้อมูลระหว่างหน้าเว็บกับ Google Apps Script
 */

const apiService = {
  // ดึงรายการภาพวาดทั้งหมดจาก Google Sheets
  async getArtworks() {
    try {
      const response = await fetch(`${CONFIG.SCRIPT_URL}?action=getArtworks`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Fetch Artworks Error:", error);
      throw error;
    }
  },

  // อัปโหลดภาพวาดใหม่เข้า Google Drive และบันทึกข้อมูลลง Google Sheets
  async uploadArtwork(payload) {
    try {
      // ใช้ Content-Type เป็น text/plain;charset=utf-8 เพื่อเลี่ยงปัญหาการบล็อก CORS จาก Google Apps Script
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "uploadArtwork",
          payload: payload
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
};

// ประกาศ Alias ตัวแปรเพิ่มเติมเพื่อป้องกันปัญหากรณีไฟล์อื่นเรียกใช้ชื่อ API แบบตัวพิมพ์ใหญ่
const API = apiService;
