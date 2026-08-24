/**
 * uploadModal.js - Artwork Upload Modal & Image Drag-and-Drop Handler
 */

class UploadModalComponent {
  constructor() {
    this.selectedFileBase64 = null;
    this.selectedFileName = '';
  }

  open() {
    if (!authManager.canUpload()) {
      showToast('เฉพาะบัญชีระดับ Artist หรือ Admin เท่านั้นที่สามารถอัปโหลดผลงานได้', 'error');
      return;
    }

    const modal = document.getElementById('upload-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      this.bindDragDrop();
    }
  }

  close() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      this.resetForm();
    }
  }

  bindDragDrop() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');

    if (!dropArea || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.classList.add('border-purple-500', 'bg-purple-500/10');
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.classList.remove('border-purple-500', 'bg-purple-500/10');
    });

    dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length) this.handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) this.handleFile(e.target.files[0]);
    });
  }

  handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WebP)', 'error');
      return;
    }

    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFileBase64 = e.target.result;
      const preview = document.getElementById('image-preview');
      const dropText = document.getElementById('drop-text');
      
      if (preview) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
      }
      if (dropText) dropText.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  async submitUpload() {
    const titleInput = document.getElementById('upload-title');
    const descInput = document.getElementById('upload-desc');
    const catSelect = document.getElementById('upload-category');
    const visSelect = document.getElementById('upload-visibility');
    const btn = document.getElementById('btn-submit-upload');

    if (!titleInput.value.trim()) {
      showToast('กรุณากรอกชื่อผลงานภาพวาด', 'error');
      return;
    }

    if (!this.selectedFileBase64) {
      showToast('กรุณาเลือกหรืออัปโหลดไฟล์รูปภาพ', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> กำลังอัปโหลดภาพเข้า Google Drive...`;

    const payload = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      categoryId: parseInt(catSelect.value) || 1,
      visibility: visSelect.value || 'Public',
      imageBase64: this.selectedFileBase64,
      fileName: this.selectedFileName || 'artwork.png',
      userId: authManager.currentUser.userId
    };

    const res = await apiService.request('createArtwork', {}, payload);

    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-cloud-upload-alt mr-2"></i> อัปโหลดผลงาน`;

    if (res.success) {
      showToast('อัปโหลดผลงานเข้าสู่ระบบเรียบร้อยแล้ว!', 'success');
      this.close();
      galleryComponent.loadData();
    } else {
      showToast('อัปโหลดไม่สำเร็จ: ' + (res.error || 'ข้อผิดพลาดเครือข่าย'), 'error');
    }
  }

  resetForm() {
    this.selectedFileBase64 = null;
    this.selectedFileName = '';
    const titleInput = document.getElementById('upload-title');
    const descInput = document.getElementById('upload-desc');
    const preview = document.getElementById('image-preview');
    const dropText = document.getElementById('drop-text');

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (dropText) dropText.classList.remove('hidden');
  }
}

const uploadModalComponent = new UploadModalComponent();
