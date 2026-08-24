/**
 * dashboard.js - Enterprise Analytics Dashboard & Chart.js Visualizations
 */

class DashboardComponent {
  constructor() {
    this.chartInstance = null;
  }

  async init() {
    if (!authManager.canViewDashboard()) {
      const container = document.getElementById('dashboard-section');
      if (container) {
        container.innerHTML = `
          <div class="glass-card p-12 text-center my-8">
            <i class="fas fa-lock text-5xl text-purple-400 mb-4"></i>
            <h3 class="text-xl font-bold text-white">ต้องการสิทธิ์การเข้าถึง</h3>
            <p class="text-slate-400 mt-2">เฉพาะบัญชี Admin หรือ Artist เท่านั้นที่สามารถดูแดชบอร์ดสถิติได้</p>
          </div>
        `;
      }
      return;
    }

    await this.loadStats();
  }

  async loadStats() {
    const res = await apiService.request('getDashboardStats');
    
    let stats = {
      totalArtworks: 12,
      totalUsers: 48,
      totalViews: 4550,
      totalLikes: 1146,
      recentLogs: []
    };

    if (res.success && res.data) {
      stats = res.data;
    }

    this.renderKPICards(stats);
    this.renderCharts(stats);
    this.renderActivityLogs(stats.recentLogs || []);
  }

  renderKPICards(stats) {
    const kpiContainer = document.getElementById('kpi-cards');
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
      <div class="glass-card p-6 border-l-4 border-l-cyan-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase">ผลงานทั้งหมด</p>
            <h3 class="text-3xl font-extrabold text-white mt-1">${stats.totalArtworks}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
            <i class="fas fa-palette"></i>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-l-4 border-l-purple-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase">ยอดเข้าชมทั้งหมด</p>
            <h3 class="text-3xl font-extrabold text-white mt-1">${stats.totalViews.toLocaleString()}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
            <i class="fas fa-eye"></i>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-l-4 border-l-pink-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase">ยอดถูกใจรวม</p>
            <h3 class="text-3xl font-extrabold text-white mt-1">${stats.totalLikes.toLocaleString()}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl">
            <i class="fas fa-heart"></i>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-l-4 border-l-amber-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase">ผู้ใช้งานทั้งหมด</p>
            <h3 class="text-3xl font-extrabold text-white mt-1">${stats.totalUsers}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            <i class="fas fa-users"></i>
          </div>
        </div>
      </div>
    `;
  }

  renderCharts(stats) {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
        datasets: [
          {
            label: 'ยอดการเข้าชม (Views)',
            data: [650, 1100, 1800, 2400, 3100, 3900, stats.totalViews || 4550],
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'การมีส่วนร่วม (Likes & Comments)',
            data: [200, 450, 600, 850, 920, 1050, stats.totalLikes || 1146],
            borderColor: '#EC4899',
            backgroundColor: 'rgba(236, 72, 153, 0.15)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94A3B8' } }
        },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  renderActivityLogs(logs) {
    const tbody = document.getElementById('activity-logs-tbody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4 text-slate-500 italic">ไม่มีข้อมูลบันทึกกิจกรรมล่าสุด</td>
        </tr>
      `;
      return;
    }

    let html = '';
    logs.forEach(log => {
      html += `
        <tr class="border-b border-slate-700/40 hover:bg-slate-800/40 text-sm">
          <td class="py-3 px-4 text-slate-400">${new Date(log.Timestamp || Date.now()).toLocaleString()}</td>
          <td class="py-3 px-4 font-medium text-purple-300">${log.UserID || 'System'}</td>
          <td class="py-3 px-4"><span class="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-1 rounded-full">${log.Action}</span></td>
          <td class="py-3 px-4 text-slate-300">${log.Details}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }
}

const dashboardComponent = new DashboardComponent();
