// ==========================================
// UPLOAD MODAL COMPONENT
// ==========================================

const uploadModalComponent = {
  open: function() {
    const modal = document.getElementById('upload-modal');
    if (!modal) return;

    // เติมโครงสร้างฟอร์มลงใน Modal Container ถ้ายังไม่มี
    modal.innerHTML = `
      <div class="glass-panel border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in relative">
        <button onclick="uploadModalComponent.close()" class="absolute top-4 right-4 text-slate-400 hover:text-white">
          <i class="fas fa-times text-lg"></i>
        </button>
        
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-cloud-upload-alt text-purple-400"></i> อัปโหลดผลงานศิลปะ
        </h3>

        <form id="upload-form" onsubmit="uploadModalComponent.submit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">ชื่อผลงาน</label>
            <input type="text" id="up-title" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">คำอธิบาย</label>
            <textarea id="up-desc" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">หมวดหมู่</label>
              <select id="up-category" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500">
                <option value="Digital Art">Digital Art</option>
                <option value="Illustration">Illustration</option>
                <option value="Concept Art">Concept Art</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">ชื่อศิลปิน</label>
              <input type="text" id="up-artist" value="Peeraphat" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">ลิงก์รูปภาพ (Image URL)</label>
            <input type="url" id="up-image" placeholder="https://..." required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="uploadModalComponent.close()" class="px-4 py-2 rounded-xl text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition">ยกเลิก</button>
            <button type="submit" class="px-4 py-2 rounded-xl text-sm bg-purple-600 hover:bg-purple-500 text-white font-semibold transition">ยืนยันอัปโหลด</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  close: function() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  submit: async function(event) {
    event.preventDefault();
    
    // ดึงค่าตัวแปร WEB_APP_URL จากไฟล์ config.js ของคุณ
    const url = typeof WEB_APP_URL !== 'undefined' ? WEB_APP_URL : ""; 
    if (!url) {
      alert("ไม่พบ URL ของ Apps Script กรุณาตรวจสอบไฟล์ config.js");
      return;
    }

    const payload = {
      title: document.getElementById('up-title').value,
      description: document.getElementById('up-desc').value,
      categoryName: document.getElementById('up-category').value,
      artistName: document.getElementById('up-artist').value,
      imageUrl: document.getElementById('up-image').value
    };

    try {
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = "กำลังอัปโหลด...";
      submitBtn.disabled = true;

      const response = await fetch(url + "?action=uploadArtwork", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        alert("อัปโหลดผลงานสำเร็จ!");
        uploadModalComponent.close();
        location.reload(); // รีเฟรชหน้าจอเพื่อดึงข้อมูลใหม่มาแสดง
      } else {
        alert("อัปโหลดไม่สำเร็จ: " + (result.message || "เกิดข้อผิดพลาด"));
        submitBtn.textContent = "ยืนยันอัปโหลด";
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      const submitBtn = event.target.querySelector('button[type="submit"]');
      if(submitBtn) {
        submitBtn.textContent = "ยืนยันอัปโหลด";
        submitBtn.disabled = false;
      }
    }
  }
};
