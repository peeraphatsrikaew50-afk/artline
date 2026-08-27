/**
 * src/js/components/uploadModal.js
 * จัดการ Modal อัปโหลดผลงานภาพวาด (แบบปลอดภัย ไม่กระทบระบบอื่น)
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
    // 1. ดักจับปุ่ม "อัปโหลดผลงาน" ที่อยู่ขวาบน เพื่อสั่งเปิด Modal
    // รองรับทั้งกรณีหาด้วย ID หรือดึงจากปุ่มที่มีไอคอนคลาวด์อัปโหลด
    const openModalBtns = document.querySelectorAll('#nav-btn-upload, button');
    openModalBtns.forEach(btn => {
      // เช็กว่าเป็นปุ่มอัปโหลดขวาบน (สังเกตจากข้อความหรือไอคอน)
      if (btn.textContent.includes('อัปโหลดผลงาน') || btn.id === 'nav-btn-upload' || btn.innerHTML.includes('fa-cloud-upload-alt')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      }
    });

    // ดักจับปุ่มปิด Modal (ปุ่มกากบาท หรือปุ่มยกเลิก ถ้ามี)
    const closeBtns = document.querySelectorAll('#close-upload-modal, .close-modal-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    });

    if (!this.fileInput || !this.dropArea) return;

    // เลือกไฟล์ผ่าน Input ปกติ
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

    // ผูก Event ให้กับปุ่มส่งข้อมูลอัปโหลด
    const submitBtn = document.getElementById('btn-submit-upload');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitUpload();
      });
    }
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
    
    const titleInput = document.getElementById('upload-title');
    const descInput = document.getElementById('upload-desc');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
  }

  async submitUpload() {
    const titleEl = document.getElementById('upload-title');
    const descEl = document.getElementById('upload-desc');
    const categoryEl = document.getElementById('upload-category');
    const visibilityEl = document.getElementById('upload-visibility');
    const submitBtn = document.getElementById('btn-submit-upload');

    const title = titleEl ? titleEl.value.trim() : '';
    const desc = descEl ? descEl.value.trim() : '';
    const categoryId = categoryEl ? categoryEl.value : '';
    const visibility = visibilityEl ? visibilityEl.value : '';

    if (!this.selectedFileBase64) {
      alert('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (!title) {
      alert('กรุณากรอกชื่อผลงาน');
      return;
    }

    // ล็อกปุ่มกันกดซ้ำเฉพาะปุ่มนี้
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> กำลังอัปโหลด...';
    }

    const payload = {
      title: title,
      description: desc,
      categoryName: categoryId || 'Digital Art',
      imageUrl: this.selectedFileBase64,
      artistName: (typeof authService !== 'undefined' && authService.getUserName) ? authService.getUserName() : 'Anonymous'
    };

    try {
      const result = await apiService.uploadArtwork(payload);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-1.5"></i> อัปโหลดผลงาน';
      }

      if (result && result.success) {
        alert('อัปโหลดผลงานเรียบร้อยแล้ว!');
        this.close();
        if (typeof galleryComponent !== 'undefined' && galleryComponent.fetchAndRender) {
          galleryComponent.fetchAndRender();
        }
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result?.error || 'ไม่สามารถบันทึกข้อมูลได้'));
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-1.5"></i> อัปโหลดผลงาน';
      }
      console.error('Upload Error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
    }
  }
}

// สร้าง Instance แยกเฉพาะตัว
const uploadModalComponent = new UploadModalComponent();
