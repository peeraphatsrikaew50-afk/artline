/**
 * auth.js - User Authentication, Guest Session & RBAC Manager
 */

class AuthManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('oa_user')) || {
      userId: '',
      username: 'Guest User',
      role: 'Guest', // 'Admin', 'Artist', 'Member', 'Guest'
      isEarlyAccess: false
    };

    this.sessionId = localStorage.getItem('oa_session_id') || this.initGuestSession();
  }

  initGuestSession() {
    const id = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('oa_session_id', id);
    return id;
  }

  setRole(role) {
    this.currentUser.role = role;
    if (role === 'Admin') {
      this.currentUser.username = 'AdminArtist';
      this.currentUser.userId = 'usr_admin_001';
      this.currentUser.isEarlyAccess = true;
    } else if (role === 'Artist') {
      this.currentUser.username = 'DigitalCreator';
      this.currentUser.userId = 'usr_artist_002';
      this.currentUser.isEarlyAccess = true;
    } else if (role === 'Member') {
      this.currentUser.username = 'ArtLoverMember';
      this.currentUser.userId = 'usr_member_003';
      this.currentUser.isEarlyAccess = true;
    } else {
      this.currentUser.username = 'Guest User';
      this.currentUser.userId = '';
      this.currentUser.isEarlyAccess = false;
    }

    localStorage.setItem('oa_user', JSON.stringify(this.currentUser));
    window.location.reload();
  }

  isLoggedIn() {
    return this.currentUser.role !== 'Guest';
  }

  canUpload() {
    return this.currentUser.role === 'Artist' || this.currentUser.role === 'Admin';
  }

  canViewDashboard() {
    return this.currentUser.role === 'Admin' || this.currentUser.role === 'Artist';
  }
}

const authManager = new AuthManager();
