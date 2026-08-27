/**
 * src/js/api.js
 * รวมฟังก์ชันจัดการ API Connection ทั้งหมด
 */

class ApiService {
  constructor() {
    // ดึง URL จาก config.js หรือใช้ค่า Default
    this.baseUrl = typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL 
      ? CONFIG.API_BASE_URL 
      : 'https://script.google.com/macros/s/AKfycbxMv5yT3L8CAMMOC0-dvrzANhR5p5h7zj7rUsN3KwvAFKWgVgPrdfs44it49FP_flBX/exec';
  }

  /**
   * ฟังก์ชันส่ง Request กลาง (รองรับ GET และ POST สำหรับ Google Apps Script)
   */
  async request(action, payload = {}, method = 'GET') {
    try {
      let url = `${this.baseUrl}?action=${encodeURIComponent(action)}`;
      let options = {
        method: method,
        redirect: 'follow'
      };

      if (method === 'POST') {
        // ส่งแบบ text/plain เพื่อเลี่ยงปัญหา CORS Preflight กับ Google Apps Script
        options.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        options.body = JSON.stringify({ action, ...payload });
      } else if (method === 'GET' && Object.keys(payload).length > 0) {
        const queryParams = new URLSearchParams(payload).toString();
        url += `&${queryParams}`;
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API Error] Action: ${action} -`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ดึงรายการผลงานภาพวาดทั้งหมด
   */
  async getArtworks(params = {}) {
    return await this.request('getArtworks', params, 'GET');
  }

  /**
   * อัปโหลดผลงานภาพวาดใหม่ (แปลงภาพเป็น Base64 แล้วส่งไปที่ Google Drive/Sheets)
   */
  async uploadArtwork(artworkData) {
    return await this.request('uploadArtwork', artworkData, 'POST');
  }

  /**
   * ดึงสถิติสำหรับ Dashboard (Analytics)
   */
  async getDashboardStats() {
    return await this.request('getDashboardStats', {}, 'GET');
  }

  /**
   * กดถูกใจผลงานภาพวาด (Like Artwork)
   */
  async likeArtwork(artworkId) {
    return await this.request('likeArtwork', { id: artworkId }, 'POST');
  }

  /**
   * บันทึก Log กิจกรรมลงในระบบ
   */
  async logActivity(user, action, details) {
    return await this.request('logActivity', { user, action, details }, 'POST');
  }
}

// สร้าง Instance หลักเพื่อใช้งาน
const apiService = new ApiService();

// ==========================================
// API Aliases (เพื่อรองรับการเรียกใช้สไตล์ฟังก์ชันเดี่ยว)
// ==========================================
const getArtworks = (params) => apiService.getArtworks(params);
const uploadArtwork = (data) => apiService.uploadArtwork(data);
const getDashboardStats = () => apiService.getDashboardStats();
const likeArtwork = (id) => apiService.likeArtwork(id);
