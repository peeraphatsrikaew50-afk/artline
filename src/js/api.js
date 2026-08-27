/**
 * api.js - Client API Service Layer
 */

class ApiService {
  constructor() {
    // 📍 Web App URL ล่าสุดของคุณ
    this.apiUrl = "https://script.google.com/macros/s/AKfycbxMv5yT3L8CAMMOC0-dvrzANhR5p5h7zj7rUsN3KwvAFKWgVgPrdfs44it49FP_flBX/exec";
  }

  /**
   * ส่ง Request ไปหา Google Apps Script Backend
   */
  async request(action, params = {}, postBody = null) {
    try {
      let url = `${this.apiUrl}?action=${encodeURIComponent(action)}`;
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url += `&${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
        }
      });

      const options = {
        method: postBody ? 'POST' : 'GET',
        redirect: 'follow'
      };

      if (postBody) {
        // ใช้ text/plain เพื่อเลี่ยง CORS OPTIONS Preflight
        options.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        options.body = JSON.stringify({ action, ...postBody });
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      console.error(`⚠️ API Error [${action}]:`, err.message);
      showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  }

  /**
   * ฟังก์ชันสำหรับอัปโหลดสร้าง Artwork ใหม่
   */
  async createArtwork(artworkData) {
    return await this.request('createArtwork', {}, artworkData);
  }
}

const apiService = new ApiService();

/**
 * Toast Notification UI Helper (แก้ปัญหา showToast is not defined)
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
  toast.style.cssText = `padding:12px 20px;border-radius:8px;color:#fff;background:${bgColor};box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:sans-serif;font-size:14px;transition:all 0.3s ease;`;
  toast.innerText = message;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
