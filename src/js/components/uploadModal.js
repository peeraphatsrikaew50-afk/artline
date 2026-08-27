/**
 * src/js/components/uploadModal.js
 * จัดการ Modal อัปโหลดผลงานภาพวาด
 */

class UploadModalComponent {
  constructor() {
    this.modal = document.getElementById('upload-modal');
    this.fileInput = document.getElementById('file-input');
    this.dropArea = document.getElementById('drop-area');
    this.previewImg = document.getElementById('image-preview');
    this.dropText = document.getElementById('drop-text');
    this.selectedFileBase64 = null;
    this.selectedFileType = null;
    this.selectedFileName = null;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.fileInput || !this.dropArea) return;

    // เลือกไฟล์ผ่าน Input
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFileSelect(file);
    });

    // Drag & Drop File
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropArea.classList.add('border-purple-500', 'bg-purple-500/10');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropArea.classList.remove('border-purple-500', 'bg-purple-500/10');
      }, false);
    });

    this.dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) this.handleFileSelect(file);
    });
  }

  handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    this.selectedFileType = file.type;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFileBase64 = e.target.result;
      if (this.previewImg) {
        this.previewImg.src = e.target.result;
        this.previewImg.classList.remove('hidden');
      }
      if (this.dropText) {
        this.dropText.classList.add('hidden');
      }
    };
    reader.readAsDataURL(file);
  }

  open() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.modal.classList.add('flex');
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      this.modal.classList.remove('flex');
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedFileBase64 = null;
    this.selectedFileType = null;
    this.selectedFileName = null;
    if (this.fileInput) this.fileInput.value = '';
    if (this.previewImg) {
      this.previewImg.src = '';
      this.previewImg.classList.add('hidden');
    }
    if (this.dropText) this.dropText.classList.remove('hidden');
    
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-desc').value = '';
  }

  async submitUpload() {
    const title = document.getElementById('upload-title').value.trim();
    const desc = document.getElementById('upload-desc').value.trim();
    const categoryId = document.getElementById('upload-category').value;
    const visibility = document.getElementById('upload-visibility').value;
    const submitBtn = document.getElementById('btn-submit-upload');

    if (!this.selectedFileBase64) {
      alert('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (!title) {
      alert('กรุณากรอกชื่อผลงาน');
      return;
    }

    // ล็อกปุ่มป้องกันการกดซ้ำ
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> กำลังอัปโหลด...';
    }

    const payload = {
      title: title,
      description: desc,
      categoryId: categoryId,
      visibility: visibility,
      fileBase64: this.selectedFileBase64,
      fileType: this.selectedFileType,
      fileName: this.selectedFileName,
      artistName: typeof authService !== 'undefined' ? authService.getUserName() : 'Anonymous'
    };

    // ส่งข้อมูลไปที่ API
    const result = await apiService.uploadArtwork(payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-1.5"></i> อัปโหลดผลงาน';
    }

    if (result && result.success) {
      alert('อัปโหลดผลงานเรียบร้อยแล้ว!');
      this.close();
      if (typeof galleryComponent !== 'undefined') {
        galleryComponent.fetchAndRender();
      }
    } else {
      alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + (result.error || 'ไม่สามารถเชื่อมต่อไดรฟ์ได้'));
    }
  }
}

// สร้าง Instance หลักสำหรับใช้งาน
const uploadModalComponent = new UploadModalComponent();
