class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
  }

  // ฟังก์ชันส่ง HTTP Request หลัก
  async request(action, options = {}) {
    try {
      const method = options.method || 'GET';
      const bodyData = options.body ? options.body : null;

      const url = `${this.baseUrl}?action=${action}`;
      
      const fetchOptions = {
        method: method,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // ป้องกันปัญหา CORS Preflight กับ Google Apps Script
        }
      };

      if (method === 'POST' && bodyData) {
        fetchOptions.body = JSON.stringify(bodyData);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      return data;
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
