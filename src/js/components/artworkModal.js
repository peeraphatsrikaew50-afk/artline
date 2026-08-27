class ArtworkModalComponent {
  constructor() {
    this.modalEl = document.getElementById('artwork-modal');
    this.contentEl = document.getElementById('artwork-modal-content');
    this.currentArtwork = null;
  }

  async open(artworkId) {
    if (!this.modalEl || !this.contentEl) return;

    this.modalEl.classList.remove('hidden');
    this.modalEl.classList.add('flex');
    this.contentEl.innerHTML = `
      <div class="p-12 text-center text-slate-400">
        <i class="fas fa-spinner fa-spin text-3xl text-purple-500 mb-3"></i>
        <p>กำลังโหลดข้อมูลผลงาน...</p>
      </div>
    `;

    try {
      const response = await apiService.getArtworkDetail(artworkId);
      console.log('API Response:', response); // Log ดูค่าที่ส่งกลับมาจาก GAS

      // รองรับทั้ง response.data และ response ตรงๆ
      if (response && (response.success || response.id || response.data)) {
        this.currentArtwork = response.data || response;
        this.render();
      } else {
        this.contentEl.innerHTML = `<div class="p-8 text-center text-red-400">ไม่สามารถโหลดข้อมูลผลงานได้ (โครงสร้างข้อมูลไม่ถูกต้อง)</div>`;
      }
    } catch (err) {
      console.error(err);
      this.contentEl.innerHTML = `<div class="p-8 text-center text-red-400">เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์</div>`;
    }
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    this.modalEl.classList.remove('flex');
  }

  render() {
    const item = this.currentArtwork;
    if (!item) return;

    const commentsHtml = (item.comments && Array.isArray(item.comments)) 
      ? item.comments.map(c => `
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
          <div class="flex justify-between text-slate-400">
            <span class="font-semibold text-purple-300">${c.user || 'ผู้ใช้งาน'} (${c.role || 'Guest'})</span>
            <span>${c.timestamp || ''}</span>
          </div>
          <p class="text-slate-200">${c.text || ''}</p>
        </div>
      `).join('')
      : `<p class="text-xs text-slate-500 italic">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!</p>`;

    this.contentEl.innerHTML = `
      <div class="relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden">
        <button onclick="artworkModalComponent.close()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-slate-400 hover:text-white flex items-center justify-center transition">
          <i class="fas fa-times"></i>
        </button>

        <div class="md:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[300px]">
          <img src="${item.imageUrl || ''}" alt="${item.title || ''}" class="max-h-[75vh] w-auto object-contain rounded-lg">
        </div>

        <div class="md:w-2/5 p-6 flex flex-col justify-between bg-slate-900/40 space-y-4 overflow-y-auto">
          <div class="space-y-4">
            <div>
              <span class="inline-block px-2.5 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                ${item.categoryName || 'Digital Art'}
              </span>
              <h3 class="text-xl font-bold text-white">${item.title || 'ไม่มีชื่อผลงาน'}</h3>
              <p class="text-xs text-purple-300 mt-1"><i class="fas fa-paint-brush mr-1"></i> ศิลปิน: ${item.artistName || 'ไม่ระบุ'}</p>
            </div>

            <p class="text-slate-300 text-xs leading-relaxed">${item.description || 'ไม่มีคำอธิบายผลงาน'}</p>

            <div class="flex items-center justify-between pt-2 border-t border-slate-800">
              <div class="flex items-center gap-2">
                <button onclick="artworkModalComponent.toggleLike()" class="px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                  <i class="fas fa-heart"></i> ไลก์ (${item.likes || 0})
                </button>
                <button onclick="artworkModalComponent.toggleFavorite()" class="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                  <i class="fas fa-star"></i> บันทึก
                </button>
              </div>
              <span class="text-xs text-slate-400"><i class="fas fa-eye mr-1"></i> ${item.views || 0} ยอดเข้าชม</span>
            </div>

            <div class="space-y-2 pt-2 border-t border-slate-800">
              <h4 class="text-xs font-bold text-slate-300">ความคิดเห็น (${(item.comments && item.comments.length) || 0})</h4>
              <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                ${commentsHtml}
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800 flex gap-2">
            <input type="text" id="modal-comment-input" placeholder="เขียนความคิดเห็น..." class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
            <button onclick="artworkModalComponent.submitComment()" class="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-semibold transition">
              ส่ง
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async toggleLike() {
    if (!this.currentArtwork) return;
    const role = (window.authService && window.authService.getCurrentRole) ? window.authService.getCurrentRole() : 'Guest';
    try {
      const res = await apiService.toggleLike(this.currentArtwork.id, role);
      if (res && res.success) {
        this.currentArtwork.likes = res.likes;
        this.render();
      }
    } catch (e) { console.error(e); }
  }

  async toggleFavorite() {
    if (!this.currentArtwork) return;
    const role = (window.authService && window.authService.getCurrentRole) ? window.authService.getCurrentRole() : 'Guest';
    try {
      const res = await apiService.toggleFavorite(this.currentArtwork.id, role);
      if (res && res.success) {
        alert(res.message || 'บันทึกสำเร็จ');
      }
    } catch (e) { console.error(e); }
  }

  async submitComment() {
    const input = document.getElementById('modal-comment-input');
    if (!input || !input.value.trim() || !this.currentArtwork) return;

    const role = (window.authService && window.authService.getCurrentRole) ? window.authService.getCurrentRole() : 'Guest';
    try {
      const res = await apiService.addComment(this.currentArtwork.id, input.value.trim(), role);
      if (res && res.success) {
        this.currentArtwork.comments = res.comments;
        this.render();
      }
    } catch (e) { console.error(e); }
  }
}

const artworkModalComponent = new ArtworkModalComponent();
