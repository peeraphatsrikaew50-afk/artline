/**
 * API Service Component
 */

const API = {
  // ดึงรายการภาพวาดทั้งหมด
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

  // อัปโหลดภาพวาดใหม่
  async uploadArtwork(payload) {
    try {
      // ใช้ text/plain เพื่อป้องกันการบล็อก CORS จาก Google Apps Script
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
