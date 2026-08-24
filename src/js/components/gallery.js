/**
 * gallery.js - Dynamic Artwork Gallery Grid, Filtering, Search & Early Access Component
 */

class GalleryComponent {
  constructor() {
    this.artworks = [];
    this.categories = [];
    this.tags = [];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'trending';
  }

  async init() {
    this.bindEvents();
    await this.loadData();
  }

  bindEvents() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderGallery();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderGallery();
      });
    }
  }

  async loadData() {
    this.showSkeletons();
    
    // Fetch artworks and categories concurrently
    const [artRes, catRes] = await Promise.all([
      apiService.request('getArtworks'),
      apiService.request('getCategories')
    ]);

    if (artRes.success && Array.isArray(artRes.data)) {
      this.artworks = artRes.data;
    } else {
      // Mock Fallback if sheet empty
      this.artworks = this.getMockArtworks();
    }

    if (catRes.success && Array.isArray(catRes.data)) {
      this.categories = catRes.data;
      this.renderCategories();
    }

    this.renderGallery();
  }

  showSkeletons() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    let html = '';
    for (let i = 0; i < 6; i++) {
      html += `
        <div class="glass-card overflow-hidden">
          <div class="skeleton h-64 w-full"></div>
          <div class="p-4 space-y-3">
            <div class="skeleton h-5 w-3/4"></div>
            <div class="skeleton h-4 w-1/2"></div>
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;
  }

  renderCategories() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    let html = `<button class="category-pill active px-4 py-2 rounded-full text-sm font-medium transition glass-panel" data-id="all">ทั้งหมด</button>`;
    
    this.categories.forEach(cat => {
      html += `<button class="category-pill px-4 py-2 rounded-full text-sm font-medium transition glass-panel text-slate-300 hover:text-white" data-id="${cat.CategoryID}">${cat.CategoryName}</button>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.category-pill').forEach(b => {
          b.classList.remove('active', 'bg-purple-600', 'text-white');
          b.classList.add('text-slate-300');
        });
        e.target.classList.add('active', 'bg-purple-600', 'text-white');
        this.currentCategory = e.target.getAttribute('data-id');
        this.renderGallery();
      });
    });
  }

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    let filtered = [...this.artworks];

    // Category Filter
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(a => String(a.categoryId) === String(this.currentCategory));
    }

    // Search Filter
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.artist.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (this.sortBy === 'trending') {
      filtered.sort((a, b) => (b.viewCount + b.likeCount * 2) - (a.viewCount + a.likeCount * 2));
    } else if (this.sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.sortBy === 'likes') {
      filtered.sort((a, b) => b.likeCount - a.likeCount);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16 glass-card">
          <i class="fas fa-palette text-5xl text-purple-400 mb-4"></i>
          <h3 class="text-xl font-semibold">ไม่พบผลงานภาพวาด</h3>
          <p class="text-slate-400 mt-2">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ดูใหม่อีกครั้ง</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(art => {
      const isMembersOnly = art.visibility === 'MembersOnly';
      const userIsMember = authManager.currentUser.role !== 'Guest';

      html += `
        <div class="glass-card group overflow-hidden cursor-pointer flex flex-col" onclick="artworkModalComponent.open('${art.id}')">
          <div class="relative overflow-hidden aspect-square bg-slate-800">
            <img src="${art.thumbnailUrl || art.imageUrl}" alt="${art.title}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition duration-500 loading="lazy">
            
            ${isMembersOnly ? `
              <span class="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                <i class="fas fa-crown mr-1"></i> Early Access
              </span>
            ` : ''}

            <span class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-full">
              ${art.category}
            </span>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="font-semibold text-lg text-white group-hover:text-purple-400 transition line-clamp-1">${art.title}</h4>
              <p class="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <i class="fas fa-user-circle text-purple-400"></i> ${art.artist}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
              <div class="flex items-center gap-3">
                <span><i class="far fa-eye text-cyan-400"></i> ${art.viewCount || 0}</span>
                <span><i class="far fa-heart text-pink-500"></i> ${art.likeCount || 0}</span>
                <span><i class="far fa-comment text-purple-400"></i> ${art.commentCount || 0}</span>
              </div>
              <span class="text-purple-400 group-hover:translate-x-1 transition"><i class="fas fa-arrow-right"></i></span>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  getMockArtworks() {
    return [
      {
        id: "art_demo_01",
        title: "Cyberpunk Metropolis Neon",
        description: "งานวาดดิจิทัลอาร์ตฉากเมืองไซเบอร์พังก์ยามค่ำคืนด้วยโทนแสงนีออนฟ้าชมพู",
        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop",
        thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop",
        category: "Digital Art",
        categoryId: 1,
        artist: "NeonMaster",
        visibility: "Public",
        viewCount: 1420,
        likeCount: 389,
        commentCount: 42,
        tags: ["#SciFi", "#Landscape"],
        createdAt: new Date().toISOString()
      },
      {
        id: "art_demo_02",
        title: "Celestial Dragon Guardian",
        description: "มังกรแห่งพฤกษาผู้ปกป้องผืนป่าโบราณ",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop",
        thumbnailUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop",
        category: "Concept Art",
        categoryId: 3,
        artist: "MythicIllustrator",
        visibility: "MembersOnly",
        viewCount: 980,
        likeCount: 245,
        commentCount: 18,
        tags: ["#Fantasy", "#Character"],
        createdAt: new Date().toISOString()
      },
      {
        id: "art_demo_03",
        title: "Serenade in Blue",
        description: "ภาพวาดสีน้ำพอร์เทรตความเงียบสงบยามทิวากาล",
        imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop",
        thumbnailUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop",
        category: "Illustration",
        categoryId: 4,
        artist: "SoftColorArt",
        visibility: "Public",
        viewCount: 2150,
        likeCount: 512,
        commentCount: 64,
        tags: ["#Portrait", "#Vector"],
        createdAt: new Date().toISOString()
      }
    ];
  }
}

const galleryComponent = new GalleryComponent();
