/**
 * api.js - Service Layer เชื่อมต่อฐานข้อมูล GAS
 */
class ApiService {
  constructor() {
    // 📍 ใส่ Web App URL ที่ได้จากการ Deploy ล่าสุดตรงนี้
    this.apiUrl = "https://script.google.com/macros/s/AKfycbwieLywZQi50HwRHzC0gCS_JgtRlZqojKeZXUlEFKxiAJoxtissV9HdQIXZCBCsZsjy/exec";
  }

  async request(action, params = {}, postBody = null) {
    try {
      let url = `${this.apiUrl}?action=${encodeURIComponent(action)}`;
      
      const options = {
        method: postBody ? 'POST' : 'GET',
        redirect: 'follow'
      };

      if (postBody) {
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
      return JSON.parse(text);
    } catch (err) {
      console.error("API Error:", err);
      return { success: false, error: err.message };
    }
  }

  async createArtwork(data) {
    return await this.request('createArtwork', {}, data);
  }
}

const apiService = new ApiService();
