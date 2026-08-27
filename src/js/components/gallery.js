/**
 * src/js/components/gallery.js
 * จัดการการดึงข้อมูล การกรอง และการแสดงผลแกลเลอรีภาพวาด
 */

class GalleryComponent {
  constructor() {
    this.artworks = [];
    this.categories = [
      { id: 'all', name: 'ทั้งหมด', icon: 'fa-border-all' },
      { id: '1', name: 'Digital Art', icon: 'fa-paint-brush' },
      { id: '2', name: 'Fanart', icon: 'fa-heart' },
      { id: '3', name: 'Concept Art', icon: 'fa-compass' },
      { id: '4', name: 'Illustration', icon: 'fa-pen-nib' },
      { id: '5', name: '3D Art', icon: 'fa-cube' },
      { id: '6', name: 'Anime/Manga', icon: 'fa-dragon' }
    ];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'trending';

    // DOM Elements
    this.gridElement = document.getElementById('gallery-grid');
    this.pillsElement = document.getElementById('category-pills');
    this.searchInput = document.getElementById('search-input');
    this.sortSelect = document.getElementById('sort-select');
  }

  /**
   * เริ่มต้นการทำงานของ Gallery
   */
  async init() {
    this.renderCategoryPills();
    this.bindEvents();
    await this.fetchAndRender();
  }

  /**
   * ผูก Event Listeners สำหรับการค้นหาและกรองข้อมูล
   */
  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });
    }
  }

  /**
   * สร้างปุ่มเลือกหมวดหมู่ (Category Pills)
   */
  renderCategoryPills() {
    if (!this.pillsElement) return;

    this.pillsElement.innerHTML = this.categories.map(cat => `
      <button 
        data-cat-id="${cat.id}"
        onclick="galleryComponent.filterCategory('${cat.id}')"
        class="category-pill px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
          this.currentCategory === cat.id 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
            : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
        }"
      >
        <i class="fas ${cat.icon}"></i> ${cat.name}
      </button>
    `).join('');
  }

  /**
   * เปลี่ยนหมวดหมู่ที่เลือก
   */
  filterCategory(catId) {
    this.currentCategory = catId;
    this.renderCategoryPills();
    this.render();
  }

  /**
   * ดึงข้อมูลภาพวาดจาก API
   */
  async fetchAndRender() {
    if (!this.gridElement) return;

    // แสดง Skeleton / Loading State
    this.gridElement.innerHTML = Array(6).fill(0).map(() => `
      <div class="glass-card rounded-2xl p-4 border border-slate-800 animate-pulse space-y-4">
        <div class="w-full h-48 bg-slate-800/60 rounded-xl"></div>
        <div class="h-4 bg-slate-800/60 rounded w-3/4"></div>
        <div class="h-3 bg-slate-800/60 rounded w-1/2"></div>
      </div>
    `).join('');

    const res = await apiService.getArtworks();
    
    if (res && res.success && Array.isArray(res.data)) {
      this.artworks = res.data;
    } else {
      // โหลด Mock Data สำรองในกรณีที่ API ยังไม่คืนค่า
      this.artworks = this.getMockArtworks();
    }

    this.render();
  }

  /**
   * ประมวลผลและสร้าง HTML การ์ดภาพวาด
   */
  render() {
    if (!this.gridElement) return;

    // 1. กรองตามหมวดหมู่ คำค้นหา และสิทธิ์ผู้ใช้งาน (RBAC)
    const currentRole = typeof authService !== 'undefined' ? authService.getRole() : 'Guest';

    let filtered = this.artworks.filter(art => {
      // กรองสิทธิ์การมองเห็น (Visibility)
      if (art.visibility === 'Private' && currentRole !== 'Admin') return false;
      if (art.visibility === 'MembersOnly' && currentRole === 'Guest') return false;

      // กรองตามหมวดหมู่
      if (this.currentCategory !== 'all' && String(art.categoryId) !== String(this.currentCategory)) {
        return false;
      }

      // กรองตามคำค้นหา
      if (this.searchQuery) {
        const matchTitle = art.title.toLowerCase().includes(this.searchQuery);
        const matchArtist = art.artistName.toLowerCase().includes(this.searchQuery);
        const matchTags = art.tags ? art.tags.some(t => t.toLowerCase().includes(this.searchQuery)) : false;
        return matchTitle || matchArtist || matchTags;
      }

      return true;
    });

    // 2. เรียงลำดับข้อมูล
    filtered.sort((a, b) => {
      if (this.sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (this.sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      return (b.views || 0) - (a.views || 0); // trending (default)
    });

    // 3. แสดงผลหากไม่พบข้อมูล
    if (filtered.length === 0) {
      this.gridElement.innerHTML = `
        <div class="col-span-full py-16 text-center space-y-3">
          <i class="fas fa-image text-5xl text-slate-700"></i>
          <p class="text-slate-400 text-sm">ไม่พบผลงานภาพวาดที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      `;
      return;
    }

    // 4. Render Cards
    this.gridElement.innerHTML = filtered.map(art => `
      <div class="glass-card rounded-2xl overflow-hidden border border-slate-800/80 hover:border-purple-500/50 transition duration-300 group flex flex-col">
        <!-- Image Container -->
        <div class="relative overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer" onclick="artworkModalComponent.open('${art.id}')">
          <img 
            src="${art.imageUrl}" 
            alt="${art.title}" 
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onerror="this.src='https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
            <span class="text-xs text-purple-300 font-medium"><i class="fas fa-expand mr-1"></i> คลิกเพื่อดูรายละเอียด</span>
          </div>
          ${art.visibility === 'MembersOnly' ? `
            <span class="absolute top-3 left-3 bg-purple-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
              <i class="fas fa-star text-amber-300 mr-1"></i> Member Only
            </span>
          ` : ''}
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-bold text-white text-base group-hover:text-purple-400 transition line-clamp-1 cursor-pointer" onclick="artworkModalComponent.open('${art.id}')">
              ${art.title}
            </h3>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <i class="fas fa-user-circle text-purple-400"></i> ${art.artistName}
            </p>
          </div>

          <!-- Card Footer Stats -->
          <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <div class="flex items-center gap-3">
              <span><i class="fas fa-eye text-cyan-400 mr-1"></i> ${art.views || 0}</span>
              <button onclick="galleryComponent.handleLike('${art.id}', event)" class="hover:text-pink-400 transition">
                <i class="fas fa-heart text-pink-500 mr-1"></i> ${art.likes || 0}
              </button>
            </div>
            <span class="text-[11px] text-slate-500">${art.categoryName || 'Digital Art'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * จัดการการกด Like
   */
  async handleLike(artId, event) {
    if (event) event.stopPropagation();
    const art = this.artworks.find(a => String(a.id) === String(artId));
    if (art) {
      art.likes = (art.likes || 0) + 1;
      this.render();
      await apiService.likeArtwork(artId);
    }
  }

  /**
   * ข้อมูล Mockup สำหรับทดสอบเมื่อเชื่อมต่อ API ไม่ได้
   */
  getMockArtworks() {
    return [
      {
        id: '1',
        title: 'Neon Cyberpunk City',
        artistName: 'Peeraphat',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
        categoryId: '1',
        categoryName: 'Digital Art',
        views: 1240,
        likes: 350,
        visibility: 'Public',
        createdAt: '2026-08-20'
      },
      {
        id: '2',
        title: 'Fantasy Dragon Sanctuary',
        artistName: 'Artline Studio',
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop',
        categoryId: '3',
        categoryName: 'Concept Art',
        views: 890,
        likes: 210,
        visibility: 'MembersOnly',
        createdAt: '2026-08-22'
      },
      {
        id: '3',
        title: 'Anime Character Portrait',
        artistName: 'K-Artist',
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
        categoryId: '6',
        categoryName: 'Anime/Manga',
        views: 2450,
        likes: 680,
        visibility: 'Public',
        createdAt: '2026-08-25'
      }
    ];
  }
}

// สร้าง Instance หลักเพื่อเรียกใช้งาน
const galleryComponent = new GalleryComponent();
