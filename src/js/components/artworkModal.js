/**
 * artworkModal.js - Artwork Lightbox Modal, Detail View, Comments, Like & Favorite Component
 */

class ArtworkModalComponent {
  constructor() {
    this.currentArtwork = null;
  }

  async open(artworkId) {
    const modal = document.getElementById('artwork-modal');
    const content = document.getElementById('artwork-modal-content');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    content.innerHTML = `
      <div class="p-8 text-center">
        <div class="spinner border-4 border-purple-500 border-t-transparent rounded-full w-12 h-12 mx-auto animate-spin mb-4"></div>
        <p class="text-slate-300">กำลังโหลดข้อมูลผลงาน...</p>
      </div>
    `;

    // Fetch details
    const res = await apiService.request('getArtworkDetails', { id: artworkId });
    let artData = null;
    let comments = [];

    if (res.success && res.data) {
      artData = res.data.artwork;
      comments = res.data.comments || [];
    } else {
      artData = galleryComponent.artworks.find(a => String(a.id) === String(artworkId));
    }

    if (!artData) {
      showToast('ไม่พบข้อมูลผลงานภาพวาด', 'error');
      this.close();
      return;
    }

    this.currentArtwork = artData;
    this.renderModalContent(artData, comments);
  }

  renderModalContent(art, comments) {
    const content = document.getElementById('artwork-modal-content');
    
    // ✅ เพิ่ม const หน้าตัวแปร html เพื่อแก้ไข ReferenceError
    const html = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[85vh] overflow-y-auto">
        <!-- Image Lightbox Section -->
        <div class="lg:col-span-7 flex flex-col justify-center items-center bg-slate-900/60 rounded-xl overflow-hidden p-2 border border-slate-700/50">
          <img src="${art.imageUrl || art.ImageURL}" alt="${art.title || art.Title}" class="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl">
        </div>

        <!-- Details & Interaction Section -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between">
              <span class="bg-purple-600/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/30">
                ${art.category || art.CategoryID}
              </span>
              <button onclick="artworkModalComponent.close()" class="text-slate-400 hover:text-white text-xl">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <h2 class="text-2xl font-bold text-white mt-3">${art.title || art.Title}</h2>
            <p class="text-sm text-purple-400 mt-1"><i class="fas fa-user-circle"></i> ศิลปิน: ${art.artist || art.UserID}</p>

            <p class="text-sm text-slate-300 mt-3 leading-relaxed">${art.description || art.Description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>

            <!-- Tags -->
            ${art.tags && art.tags.length > 0 ? `
              <div class="flex flex-wrap gap-2 mt-4">
                ${art.tags.map(t => `<span class="text-xs bg-slate-800 text-cyan-400 px-2.5 py-1 rounded-md">${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Interaction Bar -->
          <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button onclick="artworkModalComponent.toggleLike('${art.id || art.ArtworkID}')" class="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 border border-pink-500/30 rounded-xl font-medium text-sm flex items-center gap-2 transition">
                <i class="fas fa-heart"></i> ไลก์ (<span id="modal-like-count">${art.likeCount || 0}</span>)
              </button>
              <button onclick="artworkModalComponent.toggleFavorite('${art.id || art.ArtworkID}')" class="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-xl font-medium text-sm flex items-center gap-2 transition">
                <i class="fas fa-star"></i> บันทึก
              </button>
            </div>
            <span class="text-xs text-slate-400"><i class="far fa-eye"></i> ${art.viewCount || 0} ยอดเข้าชม</span>
          </div>

          <!-- Comment Section -->
          <div class="pt-4 border-t border-slate-700/60 flex-1 flex flex-col">
            <h4 class="font-semibold text-white text-sm mb-3"><i class="far fa-comments text-purple-400"></i> ความคิดเห็น (${comments.length})</h4>

            <!-- Comment List -->
            <div class="space-y-3 max-h-40 overflow-y-auto mb-3 pr-2" id="comment-list">
              ${comments.length === 0 ? `
                <p class="text-xs text-slate-500 italic">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!</p>
              ` : comments.map(c => `
                <div class="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40 text-xs">
                  <div class="flex justify-between text-slate-400 mb-1">
                    <span class="font-semibold text-purple-300">${c.SessionID || 'Guest'}</span>
                    <span>${new Date(c.CreatedAt).toLocaleDateString()}</span>
                  </div>
                  <p class="text-slate-200">${c.Content}</p>
                </div>
              `).join('')}
            </div>

            <!-- Comment Input Box -->
            <div class="flex gap-2">
              <input type="text" id="comment-input" placeholder="เขียนความคิดเห็น..." 
                     class="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
              <button onclick="artworkModalComponent.submitComment('${art.id || art.ArtworkID}')" 
                      class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">
                ส่ง
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  async toggleLike(artworkId) {
    const res = await apiService.request('toggleLike', {}, {
      artworkId: artworkId,
      userId: authManager.currentUser.userId,
      sessionId: authManager.sessionId
    });

    if (res.success) {
      showToast(res.liked ? 'กดถูกใจผลงานแล้ว!' : 'ยกเลิกการกดถูกใจแล้ว', 'success');
      const countSpan = document.getElementById('modal-like-count');
      if (countSpan) {
        let count = parseInt(countSpan.innerText) || 0;
        countSpan.innerText = res.liked ? count + 1 : Math.max(0, count - 1);
      }
    }
  }

  async toggleFavorite(artworkId) {
    const res = await apiService.request('toggleFavorite', {}, {
      artworkId: artworkId,
      userId: authManager.currentUser.userId,
      sessionId: authManager.sessionId
    });

    if (res.success) {
      showToast(res.favorited ? 'บันทึกเข้าในรายการโปรดเรียบร้อย' : 'ลบออกจากรายการโปรดแล้ว', 'info');
    }
  }

  async submitComment(artworkId) {
    const input = document.getElementById('comment-input');
    if (!input || !input.value.trim()) return;

    const content = input.value.trim();
    input.value = '';

    const res = await apiService.request('addComment', {}, {
      artworkId: artworkId,
      userId: authManager.currentUser.userId,
      sessionId: authManager.currentUser.username,
      content: content
    });

    if (res.success) {
      showToast('แสดงความคิดเห็นสำเร็จ!', 'success');
      const list = document.getElementById('comment-list');
      if (list) {
        const newEl = document.createElement('div');
        newEl.className = 'bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40 text-xs';
        newEl.innerHTML = `
          <div class="flex justify-between text-slate-400 mb-1">
            <span class="font-semibold text-purple-300">${authManager.currentUser.username}</span>
            <span>เพิ่งเมื่อครู่</span>
          </div>
          <p class="text-slate-200">${content}</p>
        `;
        list.appendChild(newEl);
      }
    }
  }

  close() {
    const modal = document.getElementById('artwork-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
}

const artworkModalComponent = new ArtworkModalComponent();
