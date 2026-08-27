/**
 * api.js - Robust Client API Service Layer with Automatic Retry, CORS & Latency Handling
 */

class ApiService {
  constructor() {
    this.apiUrl = https://script.google.com/macros/s/AKfycbwxsa4BrvFNa_v6ASozhsfIbJY0p6XgTlLFMccA88dFA8vt7xgEz7cw5jFvE4qI3zlW/exec;
  }

  /**
   * เรียก API ของ GAS พร้อม Retry Mechanism 3 ครั้ง และ Timeout Handling
   */
  async request(action, params = {}, postBody = null, attempt = 1) {
    try {
      let url = `${this.apiUrl}?action=${encodeURIComponent(action)}`;
      
      // ต่อ Query Parameters
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
        // ใช้ text/plain เพื่อหลีกเลี่ยง CORS OPTIONS Preflight ที่ GAS ไม่รองรับ
        options.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        options.body = JSON.stringify({ action, ...postBody });
      }

      // Controller สำหรับ Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        // หาก GAS ส่ง HTML Error (เช่น หน้าขอ Permission หรือ Login)
        if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
          throw new Error('GAS ต้องการสิทธิ์เข้าถึง: กรุณาตั้งค่า Deploy เป็น "Anyone"');
        }
        throw new Error('รูปแบบข้อมูลจาก GAS ไม่ถูกต้อง: ' + text.substring(0, 100));
      }

      return data;
    } catch (err) {
      console.warn(`⚠️ API Call failed [Action: ${action}] (Attempt ${attempt}/${CONFIG.MAX_RETRIES}):`, err.message);

      if (attempt < CONFIG.MAX_RETRIES) {
        // Wait exponential backoff: 1s, 2s...
        await new Promise(res => setTimeout(res, attempt * 1000));
        return this.request(action, params, postBody, attempt + 1);
      }

      // ถ้าเป็น Create Artwork แล้วต่อ GAS ไม่สำเร็จ ให้ Fallback บันทึกลง Local สำหรับ Demo ได้
      if (action === 'createArtwork' && postBody) {
        return this.localFallbackCreateArtwork(postBody);
      }

      showToast(`การเชื่อมต่อเซิร์ฟเวอร์ขัดข้อง: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  }

  /**
   * Fallback จำลองการสร้าง Artwork หากยังไม่ได้ Deploy GAS จริง
   */
  localFallbackCreateArtwork(data) {
    const mockId = 'art_local_' + Date.now();
    const newArt = {
      id: mockId,
      title: data.title,
      description: data.description || '',
      imageUrl: data.imageBase64,
      thumbnailUrl: data.imageBase64,
      category: data.categoryId === 2 ? 'Fanart' : data.categoryId === 3 ? 'Concept Art' : 'Digital Art',
      categoryId: data.categoryId,
      artist: authManager.currentUser.username,
      visibility: data.visibility || 'Public',
      viewCount: 1,
      likeCount: 0,
      commentCount: 0,
      tags: ['#Demo', '#LocalPreview'],
      createdAt: new Date().toISOString()
    };

    if (window.galleryComponent) {
      window.galleryComponent.artworks.unshift(newArt);
      window.galleryComponent.renderGallery();
    }

    showToast('บันทึกผลงานลงในเบราว์เซอร์แล้ว (Demo Mode)', 'success');
    return { success: true, artworkId: mockId, isLocal: true };
  }
}

const apiService = new ApiService();

// Helper UI Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
