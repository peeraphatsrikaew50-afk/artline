class ApiService {
  constructor() {
    this.baseUrl = CONFIG.WEB_APP_URL; // แก้ให้ตรงกับ config.js เรียบร้อยแล้ว
  }

  // ฟังก์ชันส่ง HTTP Request หลักที่ปรับแก้เพื่อเลี่ยง CORS ของ Google Apps Script
  async request(action, options = {}) {
    try {
      const method = options.method || 'GET';
      const bodyData = options.body ? options.body : null;

      let url = `${this.baseUrl}?action=${action}`;
      
      const fetchOptions = {
        method: method,
      };

      if (method === 'POST' && bodyData) {
        fetchOptions.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        fetchOptions.body = JSON.stringify(bodyData);
      }

      const response = await fetch(url, fetchOptions);
      
      const textData = await response.text();
      try {
        return JSON.parse(textData);
      } catch (e) {
        console.warn("Response is not JSON, raw text:", textData);
        return { success: false, message: "Invalid JSON response from server" };
      }

    } catch (error) {
      console.error(`[API Error] Action: ${action} -`, error);
      throw error;
    }
  }

  // ดึงรายการผลงานทั้งหมด
  async getArtworks() {
    return this.request('getArtworks');
  }

  // ดึงรายละเอียดผลงานเดี่ยว (และเพิ่ม ยอดเข้าชม/Views)
  async getArtworkDetail(id) {
    return this.request('getArtworkDetail', {
      method: 'POST',
      body: { id }
    });
  }

  // กดถูกใจ / ยกเลิกถูกใจ
  async toggleLike(artworkId, userRole) {
    return this.request('toggleLike', {
      method: 'POST',
      body: { artworkId, userRole }
    });
  }

  // บันทึกเป็นของโปรด
  async toggleFavorite(artworkId, userRole) {
    return this.request('toggleFavorite', {
      method: 'POST',
      body: { artworkId, userRole }
    });
  }

  // ส่งความคิดเห็น (Comment)
  async addComment(artworkId, commentText, userRole) {
    return this.request('addComment', {
      method: 'POST',
      body: { artworkId, commentText, userRole }
    });
  }

  // อัปโหลดผลงานใหม่
  async uploadArtwork(payload) {
    return this.request('uploadArtwork', {
      method: 'POST',
      body: payload
    });
  }
}

const apiService = new ApiService();
