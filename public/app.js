/**
 * QuickChat - Lightweight Real-time Instant Messaging Web App
 * Built with Firebase Authentication & Firebase Realtime Database
 */

// ============================================================================
// Firebase Configuration (from your Firebase Console)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD1DxenxUulJVjCfb7vTNE6QuL8RGpOPHU",
  authDomain: "quickchat-app-43ad8.firebaseapp.com",
  databaseURL: "https://quickchat-app-43ad8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quickchat-app-43ad8",
  storageBucket: "quickchat-app-43ad8.firebasestorage.app",
  messagingSenderId: "127471531161",
  appId: "1:127471531161:web:ca4ac75f42b2dc239bb408",
  measurementId: "G-VYR1J2T6ZQ"
};

// Initialize Firebase SDK
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const rtdb = firebase.database();

// ============================================================================
// QuickChat Application Module (v1.5.1)
// ============================================================================
const APP_VERSION = 'v1.5.1';

(() => {
  'use strict';

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const state = {
    currentUser: null,
    currentUserData: null,
    currentUserPhotoURL: null,
    activeContact: null,
    users: [],
    unreadCounts: {},
    searchQuery: '',
    usersRef: null,
    messagesRef: null,
    typingRef: null,
    contactTypingRef: null,
    notificationsRef: null,
    pinnedMessageRef: null,
    pinnedMessage: null,
    connectedListener: null,
    isSubmitting: false,
    originalTitle: document.title,
    titleFlashInterval: null,
    typingTimeout: null,
    isTyping: false,
    theme: localStorage.getItem('quickchat-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    soundEnabled: localStorage.getItem('quickchat-sound') !== 'false',
    desktopNotifsEnabled: localStorage.getItem('quickchat-desktop-notifs') === 'true',
    chatSearchQuery: '',
    searchMatches: [],
    currentSearchMatchIndex: -1,
    wasOffline: false,
    replyingTo: null,
    attachedImage: null,
    mediaRecorder: null,
    audioChunks: [],
    recordTimerInterval: null,
    recordingSeconds: 0,
    audioStream: null,
    currentlyPlayingAudio: null,
    settingsPendingAvatar: undefined,
    // Essential Chat Features (v1.4.6)
    editingMessage: null,
    starredMessages: {},
    starredListener: null,
    blockedUsers: {},
    blockedListener: null,
    attachedDoc: null,
    forwardingMessage: null,
    wallpaper: localStorage.getItem('quickchat-wallpaper') || 'default'
  };

  // --------------------------------------------------------------------------
  // DOM Elements Cache (dynamically populated)
  // --------------------------------------------------------------------------
  const elements = {};

  function cacheElements() {
    // Screens
    elements.authScreen = document.getElementById('auth-screen');
    elements.chatScreen = document.getElementById('chat-screen');
    elements.profileSetupScreen = document.getElementById('profile-setup');

    // Auth Navigation & Alerts
    elements.loginTab = document.getElementById('login-tab');
    elements.registerTab = document.getElementById('register-tab');
    elements.loginForm = document.getElementById('login-form');
    elements.registerForm = document.getElementById('register-form');
    elements.authError = document.getElementById('auth-error');
    elements.googleSigninBtn = document.getElementById('google-signin-btn');

    // Login Form Fields
    elements.loginEmail = document.getElementById('login-email');
    elements.loginPassword = document.getElementById('login-password');

    // Register Form Fields
    elements.registerName = document.getElementById('register-name');
    elements.registerEmail = document.getElementById('register-email');
    elements.registerPassword = document.getElementById('register-password');
    elements.registerConfirmPassword = document.getElementById('register-confirm-password');

    // Profile Setup
    elements.profileForm = document.getElementById('profile-form');
    elements.setupDisplayName = document.getElementById('setup-display-name');
    elements.setupContinueBtn = document.getElementById('setup-continue-btn');
    elements.profileError = document.getElementById('profile-error');

    // Sidebar
    elements.userSearch = document.getElementById('user-search');
    elements.userList = document.getElementById('user-list');
    elements.currentUserName = document.getElementById('current-user-name');
    elements.userAvatar = document.getElementById('user-avatar');
    elements.signoutBtn = document.getElementById('signout-btn');

    // Sidebar Actions
    elements.starredBtn = document.getElementById('starred-btn');
    elements.themeToggleBtn = document.getElementById('theme-toggle-btn');
    elements.soundToggleBtn = document.getElementById('sound-toggle-btn');
    elements.settingsBtn = document.getElementById('settings-btn');

    // Chat Area Header
    elements.chatHeader = document.getElementById('chat-header');
    elements.chatContactName = document.getElementById('chat-contact-name');
    elements.chatContactStatus = document.getElementById('chat-contact-status');
    elements.chatContactAvatar = document.getElementById('active-contact-avatar');
    elements.typingIndicator = document.getElementById('typing-indicator');
    elements.typingName = document.getElementById('typing-name');

    // Connection Banner
    elements.connectionBanner = document.getElementById('connection-banner');
    elements.connectionText = document.getElementById('connection-text');

    // Chat Actions & Blocking
    elements.searchChatBtn = document.getElementById('search-chat-btn');
    elements.blockContactBtn = document.getElementById('block-contact-btn');
    elements.exportChatBtn = document.getElementById('export-chat-btn');
    elements.blockedBanner = document.getElementById('blocked-banner');
    elements.unblockBtn = document.getElementById('unblock-btn');
    elements.chatSearchBar = document.getElementById('chat-search-bar');
    elements.chatSearchInput = document.getElementById('chat-search-input');
    elements.chatSearchCount = document.getElementById('chat-search-count');
    elements.chatSearchPrev = document.getElementById('chat-search-prev');
    elements.chatSearchNext = document.getElementById('chat-search-next');
    elements.chatSearchClose = document.getElementById('chat-search-close');

    // Pinned Message Bar
    elements.pinnedMessageBar = document.getElementById('pinned-message-bar');
    elements.pinnedSender = document.getElementById('pinned-sender');
    elements.pinnedText = document.getElementById('pinned-text');
    elements.pinnedMsgTrigger = document.getElementById('pinned-msg-trigger');
    elements.unpinMsgBtn = document.getElementById('unpin-msg-btn');

    // Messages View
    elements.messagesContainer = document.getElementById('messages');
    elements.scrollBottomBtn = document.getElementById('scroll-bottom-btn');
    elements.newMsgBadge = document.getElementById('new-msg-badge');
    elements.emptyState = document.getElementById('empty-state');
    elements.chatInputArea = document.getElementById('chat-input-area');

    // Emoji Picker Drawer
    elements.emojiPickerBtn = document.getElementById('emoji-picker-btn');
    elements.emojiDrawer = document.getElementById('emoji-drawer');
    elements.emojiDrawerClose = document.getElementById('emoji-drawer-close');
    elements.emojiGrid = document.getElementById('emoji-grid');

    // Quoted Reply Preview Bar
    elements.replyPreviewBar = document.getElementById('reply-preview-bar');
    elements.replyToName = document.getElementById('reply-to-name');
    elements.replyToText = document.getElementById('reply-to-text');
    elements.cancelReplyBtn = document.getElementById('cancel-reply-btn');

    // Message Edit Preview Bar
    elements.editPreviewBar = document.getElementById('edit-preview-bar');
    elements.editPreviewText = document.getElementById('edit-preview-text');
    elements.cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Image Attachment & Preview
    elements.attachImageBtn = document.getElementById('attach-image-btn');
    elements.imageFileInput = document.getElementById('image-file-input');
    elements.imagePreviewTray = document.getElementById('image-preview-tray');
    elements.imagePreviewThumb = document.getElementById('image-preview-thumb');
    elements.removeImageBtn = document.getElementById('remove-image-btn');

    // Document Attachment & Preview
    elements.attachDocBtn = document.getElementById('attach-doc-btn');
    elements.docFileInput = document.getElementById('doc-file-input');
    elements.docPreviewTray = document.getElementById('doc-preview-tray');
    elements.docPreviewName = document.getElementById('doc-preview-name');
    elements.docPreviewSize = document.getElementById('doc-preview-size');
    elements.removeDocBtn = document.getElementById('remove-doc-btn');

    // Voice Recording Bar
    elements.voiceRecordBtn = document.getElementById('voice-record-btn');
    elements.voiceRecordingBar = document.getElementById('voice-recording-bar');
    elements.recordingTimer = document.getElementById('recording-timer');
    elements.cancelVoiceBtn = document.getElementById('cancel-voice-btn');
    elements.sendVoiceBtn = document.getElementById('send-voice-btn');

    // Form & Send
    elements.messageForm = document.getElementById('message-form');
    elements.messageInput = document.getElementById('message-input');
    elements.sendBtn = document.getElementById('send-btn');

    // Profile & Settings Modal
    elements.settingsModal = document.getElementById('settings-modal');
    elements.settingsCloseBtn = document.getElementById('settings-close-btn');
    elements.settingsCancelBtn = document.getElementById('settings-cancel-btn');
    elements.settingsForm = document.getElementById('settings-form');
    elements.settingsTabProfileBtn = document.getElementById('settings-tab-profile-btn');
    elements.settingsTabOptionsBtn = document.getElementById('settings-tab-options-btn');
    elements.settingsProfilePanel = document.getElementById('settings-profile-panel');
    elements.settingsOptionsPanel = document.getElementById('settings-options-panel');
    elements.settingsAvatarPreview = document.getElementById('settings-avatar-preview');
    elements.settingsAvatarUpload = document.getElementById('settings-avatar-upload');
    elements.settingsAvatarReset = document.getElementById('settings-avatar-reset');
    elements.settingsDisplayName = document.getElementById('settings-display-name');
    elements.settingsStatusBio = document.getElementById('settings-status-bio');
    elements.settingsDesktopNotifs = document.getElementById('settings-desktop-notifs');
    elements.settingsSoundToggle = document.getElementById('settings-sound-toggle');
    elements.wallpaperPicker = document.getElementById('wallpaper-picker');

    // Lightbox Modal
    elements.imageModal = document.getElementById('image-modal');
    elements.imageModalImg = document.getElementById('image-modal-img');
    elements.imageModalClose = document.getElementById('image-modal-close');

    // Starred Messages Modal
    elements.starredModal = document.getElementById('starred-modal');
    elements.starredModalClose = document.getElementById('starred-modal-close');
    elements.starredSearchInput = document.getElementById('starred-search-input');
    elements.starredMessagesList = document.getElementById('starred-messages-list');

    // Forward Message Modal
    elements.forwardModal = document.getElementById('forward-modal');
    elements.forwardModalClose = document.getElementById('forward-modal-close');
    elements.forwardPreviewSnippet = document.getElementById('forward-preview-snippet');
    elements.forwardSearchInput = document.getElementById('forward-search-input');
    elements.forwardContactList = document.getElementById('forward-contact-list');

    // Mobile
    elements.backBtn = document.getElementById('back-btn');
  }

  // Attempt initial cache if document already has elements
  cacheElements();

  // Avatar color generator palette for consistent profile colors
  const AVATAR_COLORS = [
    '#6C63FF', '#3B82F6', '#10B981', '#F59E0B',
    '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'
  ];

  const POPULAR_EMOJIS = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','🥹','😊','😇','🙂','🙃','😉',
    '😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓',
    '😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫',
    '😩','🥺','😢','😭','😮‍💨','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨',
    '👍','👎','👏','🙌','👐','🤲','🤝','🙏','✍️','💪','❤️','🧡','💛','💚','💙',
    '💜','🖤','🤍','🤎','💔','❤️‍🔥','✨','🎉','🎊','🔥','⭐','🌟','⚡','💥','💯'
  ];

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '🔥', '😮', '😢'];

  // --------------------------------------------------------------------------
  // Security & Utility Helpers
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function linkify(inputText) {
    if (!inputText) return '';
    const escaped = escapeHtml(inputText);
    const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    return escaped.replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
    });
  }

  function getAvatarColor(identifier) {
    if (!identifier) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }

  function generateAvatar(name) {
    if (!name) return '?';
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  }

  function updateUserAvatarUI(user) {
    if (!elements.userAvatar) return;
    const photoURL = user?.photoURL || state.currentUserPhotoURL || state.currentUserData?.photoURL;
    const displayName = user?.displayName || state.currentUserData?.displayName || (elements.currentUserName && elements.currentUserName.textContent !== 'Loading user...' ? elements.currentUserName.textContent : 'User');
    if (photoURL) {
      elements.userAvatar.style.backgroundImage = `url(${photoURL})`;
      elements.userAvatar.style.backgroundColor = 'transparent';
      elements.userAvatar.textContent = '';
    } else {
      elements.userAvatar.style.backgroundImage = 'none';
      elements.userAvatar.textContent = generateAvatar(displayName);
      elements.userAvatar.style.backgroundColor = getAvatarColor(user?.uid || displayName);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  function formatLastSeen(online, lastSeen) {
    if (online) return 'Online';
    if (!lastSeen) return 'Offline';

    const diffMs = Date.now() - lastSeen;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Last seen just now';
    if (diffMin < 60) return `Last seen ${diffMin}m ago`;
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    if (diffDays === 1) return 'Last seen yesterday';
    return `Last seen ${diffDays}d ago`;
  }

  function generateChatId(uid1, uid2) {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  function scrollToBottom() {
    if (elements.messagesContainer) {
      elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }
  }

  function showScrollBottomBtn(hasNew = false) {
    if (!elements.scrollBottomBtn) return;
    elements.scrollBottomBtn.classList.remove('hidden');
    if (elements.newMsgBadge) {
      if (hasNew) {
        elements.newMsgBadge.classList.remove('hidden');
      } else {
        elements.newMsgBadge.classList.add('hidden');
      }
    }
  }

  function hideScrollBottomBtn() {
    if (!elements.scrollBottomBtn) return;
    elements.scrollBottomBtn.classList.add('hidden');
    if (elements.newMsgBadge) {
      elements.newMsgBadge.classList.add('hidden');
    }
  }

  function handleMessagesScroll() {
    if (!elements.messagesContainer) return;
    const c = elements.messagesContainer;
    const isNearBottom = (c.scrollHeight - c.scrollTop - c.clientHeight) < 140;
    if (isNearBottom) {
      hideScrollBottomBtn();
    } else {
      showScrollBottomBtn(false);
    }
  }

  // --------------------------------------------------------------------------
  // Theme Management
  // --------------------------------------------------------------------------
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quickchat-theme', theme);
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
      elements.themeToggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // --------------------------------------------------------------------------
  // Sound Chime (Native Web Audio API)
  // --------------------------------------------------------------------------
  function applySoundSetting(enabled) {
    state.soundEnabled = enabled;
    localStorage.setItem('quickchat-sound', enabled ? 'true' : 'false');
    if (elements.soundToggleBtn) {
      elements.soundToggleBtn.textContent = enabled ? '🔊 Sound On' : '🔇 Muted';
      elements.soundToggleBtn.title = enabled ? 'Mute Notifications' : 'Unmute Notifications';
    }
    if (elements.settingsSoundToggle) {
      elements.settingsSoundToggle.checked = !!enabled;
    }
  }

  function toggleSoundSetting() {
    applySoundSetting(!state.soundEnabled);
    if (state.soundEnabled) {
      playNotificationChime();
    }
  }

  // --------------------------------------------------------------------------
  // Desktop Notifications (Native Web Notification API)
  // --------------------------------------------------------------------------
  async function requestDesktopNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('Desktop notifications are not supported in this browser.', 'warning');
      return false;
    }
    if (Notification.permission === 'granted') {
      applyDesktopNotifSetting(true);
      return true;
    }
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          applyDesktopNotifSetting(true);
          showToast('Desktop notifications enabled!', 'success');
          return true;
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
    applyDesktopNotifSetting(false);
    showToast('Desktop notifications were blocked or denied.', 'warning');
    return false;
  }

  function applyDesktopNotifSetting(enabled) {
    state.desktopNotifsEnabled = enabled;
    localStorage.setItem('quickchat-desktop-notifs', enabled ? 'true' : 'false');
    if (elements.settingsDesktopNotifs) {
      elements.settingsDesktopNotifs.checked = enabled;
    }
  }

  function sendDesktopNotification(senderName, text, chatId, senderId) {
    if (!state.desktopNotifsEnabled || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return;

    try {
      const n = new Notification(senderName || 'QuickChat', {
        body: text || 'Sent an attachment',
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>'
      });
      n.onclick = () => {
        window.focus();
        const contact = state.users.find((u) => u.uid === senderId);
        if (contact) selectContact(contact);
        n.close();
      };
    } catch (err) {
      console.warn('Desktop notification dispatch error:', err);
    }
  }

  function playNotificationChime() {
    if (!state.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);

      setTimeout(() => {
        try { ctx.close(); } catch (_) {}
      }, 500);
    } catch (err) {
      console.warn('Audio chime playback omitted:', err);
    }
  }

  // --------------------------------------------------------------------------
  // Title Flashing & Notifications
  // --------------------------------------------------------------------------
  function startTitleFlash(senderName) {
    if (state.titleFlashInterval) clearInterval(state.titleFlashInterval);
    let flash = false;
    state.titleFlashInterval = setInterval(() => {
      document.title = flash ? `💬 New message from ${senderName}!` : state.originalTitle;
      flash = !flash;
    }, 1000);
  }

  function stopTitleFlash() {
    if (state.titleFlashInterval) {
      clearInterval(state.titleFlashInterval);
      state.titleFlashInterval = null;
      document.title = state.originalTitle;
    }
  }

  window.addEventListener('focus', stopTitleFlash);

  // --------------------------------------------------------------------------
  // Floating Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let icon = 'ℹ️';
    if (type === 'error') icon = '⚠️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button type="button" class="toast-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast);
      }, duration);
    }
  }

  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('toast-hiding');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 250);
  }

  // --------------------------------------------------------------------------
  // In-App Notification Card
  // --------------------------------------------------------------------------
  function showInAppNotification(senderName, text, chatId, senderId) {
    let host = document.getElementById('notification-container');
    if (!host) {
      host = document.createElement('div');
      host.id = 'notification-container';
      host.className = 'notification-container';
      document.body.appendChild(host);
    }

    const card = document.createElement('div');
    card.className = 'in-app-notif';
    card.setAttribute('role', 'status');

    const avatarInitial = generateAvatar(senderName);
    const avatarColor = getAvatarColor(senderId || senderName);

    card.innerHTML = `
      <div class="notif-avatar-wrapper">
        <div class="notif-avatar" style="background-color: ${avatarColor};">${avatarInitial}</div>
      </div>
      <div class="notif-content">
        <div class="notif-header-line">
          <span class="notif-sender-name">${escapeHtml(senderName)}</span>
          <span class="notif-time-text">Just now</span>
        </div>
        <div class="notif-text-preview">${escapeHtml(text || 'Sent a message')}</div>
        <span class="notif-action-hint">Click to open chat</span>
      </div>
      <button type="button" class="notif-close-btn" aria-label="Dismiss">&times;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.notif-close-btn')) return;
      const contact = state.users.find((u) => u.uid === senderId);
      if (contact) {
        selectContact(contact);
        dismissInAppNotification(card);
      }
    });

    const closeBtn = card.querySelector('.notif-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissInAppNotification(card);
    });

    host.appendChild(card);

    setTimeout(() => {
      dismissInAppNotification(card);
    }, 6000);
  }

  function dismissInAppNotification(el) {
    if (!el || !el.isConnected) return;
    el.classList.add('closing');
    setTimeout(() => {
      if (el.isConnected) el.remove();
    }, 260);
  }

  // --------------------------------------------------------------------------
  // Tab Navigation & Errors
  // --------------------------------------------------------------------------
  function setAuthError(message) {
    if (!elements.authError) return;
    if (message) {
      elements.authError.textContent = message;
      elements.authError.classList.remove('hidden');
      elements.authError.removeAttribute('hidden');
    } else {
      elements.authError.textContent = '';
      elements.authError.classList.add('hidden');
      elements.authError.setAttribute('hidden', 'true');
    }
  }

  function setProfileError(message) {
    if (!elements.profileError) return;
    if (message) {
      elements.profileError.textContent = message;
      elements.profileError.classList.remove('hidden');
      elements.profileError.removeAttribute('hidden');
    } else {
      elements.profileError.textContent = '';
      elements.profileError.classList.add('hidden');
      elements.profileError.setAttribute('hidden', 'true');
    }
  }

  function mapAuthError(error) {
    if (!error) return 'An unknown error occurred.';
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.';
      default:
        return error.message || 'Authentication failed.';
    }
  }

  function switchAuthTab(tab) {
    setAuthError('');
    if (tab === 'login') {
      elements.loginTab?.classList.add('active');
      elements.loginTab?.setAttribute('aria-selected', 'true');
      elements.registerTab?.classList.remove('active');
      elements.registerTab?.setAttribute('aria-selected', 'false');

      elements.loginForm?.classList.remove('hidden');
      elements.loginForm?.removeAttribute('hidden');
      elements.registerForm?.classList.add('hidden');
      elements.registerForm?.setAttribute('hidden', 'true');
    } else {
      elements.registerTab?.classList.add('active');
      elements.registerTab?.setAttribute('aria-selected', 'true');
      elements.loginTab?.classList.remove('active');
      elements.loginTab?.setAttribute('aria-selected', 'false');

      elements.registerForm?.classList.remove('hidden');
      elements.registerForm?.removeAttribute('hidden');
      elements.loginForm?.classList.add('hidden');
      elements.loginForm?.setAttribute('hidden', 'true');
    }
  }

  // --------------------------------------------------------------------------
  // User Presence & Profile
  // --------------------------------------------------------------------------
  function setupPresence(uid) {
    if (!uid) return;
    const userStatusRef = rtdb.ref('users/' + uid);
    const connectedRef = rtdb.ref('.info/connected');

    if (state.connectedListener) {
      connectedRef.off('value', state.connectedListener);
    }

    state.connectedListener = connectedRef.on('value', (snap) => {
      const isConnected = snap.val() === true;
      handleConnectionChange(isConnected);

      if (isConnected) {
        userStatusRef.onDisconnect().update({
          online: false,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          userStatusRef.update({
            online: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
          });
        });
      }
    });
  }

  function handleConnectionChange(isConnected) {
    if (!elements.connectionBanner) return;
    if (!isConnected) {
      state.wasOffline = true;
      elements.connectionBanner.classList.remove('hidden', 'connected');
      if (elements.connectionText) {
        elements.connectionText.textContent = 'Connecting to QuickChat...';
      }
    } else {
      if (state.wasOffline) {
        elements.connectionBanner.classList.add('connected');
        if (elements.connectionText) {
          elements.connectionText.textContent = 'Connected to QuickChat!';
        }
        setTimeout(() => {
          elements.connectionBanner?.classList.add('hidden');
          elements.connectionBanner?.classList.remove('connected');
        }, 2200);
        state.wasOffline = false;
      } else {
        elements.connectionBanner.classList.add('hidden');
      }
    }
  }

  function showScreen(screenName) {
    if (!elements.authScreen || !elements.chatScreen) {
      cacheElements();
    }

    [elements.authScreen, elements.profileSetupScreen, elements.chatScreen].forEach((sc) => {
      if (sc) {
        sc.classList.add('hidden');
        sc.setAttribute('hidden', 'true');
        sc.classList.remove('active');
      }
    });

    if (screenName === 'auth' && elements.authScreen) {
      elements.authScreen.classList.remove('hidden');
      elements.authScreen.removeAttribute('hidden');
      elements.authScreen.classList.add('active');
    } else if (screenName === 'profile' && elements.profileSetupScreen) {
      elements.profileSetupScreen.classList.remove('hidden');
      elements.profileSetupScreen.removeAttribute('hidden');
      elements.profileSetupScreen.classList.add('active');
    } else if (screenName === 'chat' && elements.chatScreen) {
      elements.chatScreen.classList.remove('hidden');
      elements.chatScreen.removeAttribute('hidden');
      elements.chatScreen.classList.add('active');
    }
  }

  // --------------------------------------------------------------------------
  // Notification Listener (In-App)
  // --------------------------------------------------------------------------
  function startNotificationListener(currentUid) {
    if (state.notificationsRef) {
      state.notificationsRef.off();
    }
    state.notificationsRef = rtdb.ref('notifications/' + currentUid);

    state.notificationsRef.limitToLast(1).on('child_added', (snap) => {
      const notif = snap.val();
      if (!notif) return;

      const notifAge = Date.now() - (notif.timestamp || 0);
      if (notifAge > 20000) return;

      if (notif.senderId === state.currentUser?.uid) return;

      // Drop notifications from blocked users
      if (notif.senderId && state.blockedUsers && state.blockedUsers[notif.senderId]) {
        snap.ref.remove().catch(() => {});
        return;
      }

      if (state.activeContact && state.activeContact.uid === notif.senderId && document.visibilityState === 'visible') {
        return;
      }

      playNotificationChime();
      startTitleFlash(notif.senderName || 'Someone');
      showInAppNotification(notif.senderName || 'Someone', notif.text, notif.chatId, notif.senderId);
      sendDesktopNotification(notif.senderName || 'Someone', notif.text, notif.chatId, notif.senderId);

      if (notif.senderId) {
        state.unreadCounts[notif.senderId] = (state.unreadCounts[notif.senderId] || 0) + 1;
        renderUserList();
      }

      // Clean up notification entry to prevent stale re-triggers
      snap.ref.remove().catch(() => {});
    });
  }

  // --------------------------------------------------------------------------
  // Users List Listener & Renderer
  // --------------------------------------------------------------------------
  function startUsersListener() {
    if (state.usersRef) {
      state.usersRef.off();
    }
    state.usersRef = rtdb.ref('users');

    state.usersRef.on(
      'value',
      (snapshot) => {
        const users = [];
        snapshot.forEach((child) => {
          const data = child.val();
          if (child.key === state.currentUser?.uid) {
            state.currentUserData = data;
            state.currentUserPhotoURL = data.photoURL || null;
            if (data.displayName && elements.currentUserName) {
              elements.currentUserName.textContent = data.displayName;
            }
            updateUserAvatarUI({ ...state.currentUser, displayName: data.displayName || state.currentUser.displayName, photoURL: data.photoURL || null });
          } else {
            users.push({
              uid: child.key,
              displayName: data.displayName || 'Anonymous User',
              status: data.status || 'Available',
              email: data.email || '',
              photoURL: data.photoURL || null,
              online: !!data.online,
              lastSeen: data.lastSeen || null,
              createdAt: data.createdAt || null
            });
          }
        });

        state.users = users;
        renderUserList();

        if (state.activeContact) {
          const updatedActive = users.find((u) => u.uid === state.activeContact.uid);
          if (updatedActive) {
            state.activeContact = updatedActive;
            updateChatHeaderContact(updatedActive);
          }
        }
      },
      (error) => {
        console.error('Error listening to users:', error);
      }
    );
  }

  function renderUserList() {
    if (!elements.userList) return;
    elements.userList.innerHTML = '';

    const query = state.searchQuery.trim().toLowerCase();

    let filteredUsers = state.users.filter((user) => {
      if (!query) return true;
      const name = (user.displayName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const statusText = user.online ? 'online' : 'offline';
      const bio = (user.status || '').toLowerCase();
      return name.includes(query) || email.includes(query) || statusText.includes(query) || bio.includes(query);
    });

    filteredUsers.sort((a, b) => {
      if (a.online === b.online) {
        return (a.displayName || '').localeCompare(b.displayName || '');
      }
      return a.online ? -1 : 1;
    });

    if (filteredUsers.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'no-users-item';
      emptyLi.style.padding = '24px 16px';
      emptyLi.style.textAlign = 'center';
      emptyLi.style.color = 'var(--color-text-secondary)';
      emptyLi.style.fontSize = '14px';
      emptyLi.textContent = query ? 'No contacts match your search' : 'No other users yet';
      elements.userList.appendChild(emptyLi);
      return;
    }

    filteredUsers.forEach((user) => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.dataset.uid = user.uid;

      if (state.activeContact && state.activeContact.uid === user.uid) {
        li.classList.add('active');
      }

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'avatar-container';

      const avatar = document.createElement('div');
      avatar.className = 'user-avatar';
      if (user.photoURL) {
        avatar.style.backgroundImage = `url(${user.photoURL})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      } else {
        avatar.textContent = generateAvatar(user.displayName);
        avatar.style.backgroundColor = getAvatarColor(user.uid || user.displayName);
      }

      const statusDot = document.createElement('span');
      statusDot.className = user.online ? 'online-dot' : 'offline-dot';
      statusDot.setAttribute('aria-hidden', 'true');

      avatarWrap.appendChild(avatar);
      avatarWrap.appendChild(statusDot);

      const info = document.createElement('div');
      info.className = 'user-info';

      const name = document.createElement('div');
      name.className = 'user-name';
      name.textContent = user.displayName;

      const status = document.createElement('div');
      status.className = `user-status ${user.online ? 'online' : 'offline'}`;
      status.textContent = user.online ? 'Online' : 'Offline';
      if (user.status) {
        status.title = user.status;
      }

      info.appendChild(name);
      info.appendChild(status);

      li.appendChild(avatarWrap);
      li.appendChild(info);

      const unread = (state.unreadCounts && state.unreadCounts[user.uid]) || 0;
      if (unread > 0) {
        const badge = document.createElement('span');
        badge.className = 'unread-badge';
        badge.textContent = unread > 99 ? '99+' : String(unread);
        badge.title = `${unread} unread message${unread > 1 ? 's' : ''}`;
        li.appendChild(badge);
      }

      li.addEventListener('click', () => {
        selectContact(user);
      });

      elements.userList.appendChild(li);
    });
  }

  // --------------------------------------------------------------------------
  // Chat & Messaging
  // --------------------------------------------------------------------------
  function updateChatHeaderContact(contact) {
    if (!contact) return;
    if (elements.chatContactName) {
      elements.chatContactName.textContent = contact.displayName || 'Unknown';
    }

    if (elements.chatContactStatus) {
      elements.chatContactStatus.textContent = formatLastSeen(contact.online, contact.lastSeen);
    }

    if (elements.chatContactAvatar) {
      if (contact.photoURL) {
        elements.chatContactAvatar.style.backgroundImage = `url(${contact.photoURL})`;
        elements.chatContactAvatar.style.backgroundSize = 'cover';
        elements.chatContactAvatar.style.backgroundPosition = 'center';
        elements.chatContactAvatar.textContent = '';
      } else {
        elements.chatContactAvatar.style.backgroundImage = 'none';
        elements.chatContactAvatar.textContent = generateAvatar(contact.displayName);
        elements.chatContactAvatar.style.backgroundColor = getAvatarColor(contact.uid || contact.displayName);
      }
    }

    const headerStatusDot = elements.chatHeader?.querySelector('.status-dot');
    if (headerStatusDot) {
      if (contact.online) {
        headerStatusDot.classList.add('online');
        headerStatusDot.classList.remove('offline');
      } else {
        headerStatusDot.classList.remove('online');
        headerStatusDot.classList.add('offline');
      }
    }
  }

  function selectContact(contact) {
    if (!contact || !state.currentUser) return;
    state.activeContact = contact;

    const allItems = elements.userList?.querySelectorAll('.user-item');
    allItems?.forEach((el) => {
      el.classList.toggle('active', el.dataset.uid === contact.uid);
    });

    if (window.innerWidth <= 768) {
      elements.chatScreen?.classList.add('mobile-chat-active');
      document.body.classList.add('mobile-chat-active');
      try {
        history.pushState({ mobileChat: true, contactUid: contact.uid }, '', '#chat');
      } catch (_) {}
    }

    if (elements.emptyState) {
      elements.emptyState.classList.add('hidden');
      elements.emptyState.setAttribute('hidden', 'true');
    }
    if (elements.chatHeader) {
      elements.chatHeader.classList.remove('hidden');
      elements.chatHeader.removeAttribute('hidden');
    }
    if (elements.messagesContainer) {
      elements.messagesContainer.classList.remove('hidden');
      elements.messagesContainer.removeAttribute('hidden');
    }
    if (elements.chatInputArea) {
      elements.chatInputArea.classList.remove('hidden');
      elements.chatInputArea.removeAttribute('hidden');
    }

    if (state.unreadCounts && state.unreadCounts[contact.uid]) {
      delete state.unreadCounts[contact.uid];
      renderUserList();
    }

    closeChatSearch();
    closeEmojiDrawer();
    cancelReplying();
    cancelEditing();
    clearAttachedImage();
    clearAttachedDoc();
    updateChatHeaderContact(contact);
    updateBlockedStatusUI();
    setWallpaper(state.wallpaper);
    elements.messageInput?.focus();

    subscribeToMessages(contact.uid);
    subscribeToContactTyping(contact.uid);
    subscribeToPinnedMessage(contact.uid);
  }

  // --------------------------------------------------------------------------
  // Typing Indicator Logic
  // --------------------------------------------------------------------------
  function sendTypingState(isTyping) {
    if (!state.currentUser || !state.activeContact) return;
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    const typingRef = rtdb.ref(`chats/${chatId}/typing/${state.currentUser.uid}`);
    if (isTyping === 'recording') {
      typingRef.set('recording');
      typingRef.onDisconnect().set(false);
      state.isTyping = 'recording';
    } else if (isTyping) {
      typingRef.set(true);
      typingRef.onDisconnect().set(false);
      state.isTyping = true;
    } else {
      typingRef.set(false);
      state.isTyping = false;
    }
  }

  function handleTypingInput() {
    if (!state.activeContact) return;
    if (!state.isTyping) {
      sendTypingState(true);
    }
    if (state.typingTimeout) clearTimeout(state.typingTimeout);
    state.typingTimeout = setTimeout(() => {
      sendTypingState(false);
    }, 2500);
  }

  function subscribeToContactTyping(contactUid) {
    if (state.contactTypingRef) {
      state.contactTypingRef.off();
      state.contactTypingRef = null;
    }
    if (!state.currentUser || !contactUid) return;

    const chatId = generateChatId(state.currentUser.uid, contactUid);
    state.contactTypingRef = rtdb.ref(`chats/${chatId}/typing/${contactUid}`);

    state.contactTypingRef.on('value', (snap) => {
      const typingVal = snap.val();
      if (elements.typingIndicator) {
        if (typingVal) {
          elements.typingIndicator.classList.remove('hidden');
          if (elements.typingName) {
            if (typingVal === 'recording') {
              elements.typingName.textContent = `${state.activeContact?.displayName || 'Contact'} is recording audio 🎙️...`;
            } else {
              elements.typingName.textContent = `${state.activeContact?.displayName || 'Contact'} is typing...`;
            }
          }
        } else {
          elements.typingIndicator.classList.add('hidden');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Pinned Messages (v1.4.0)
  // --------------------------------------------------------------------------
  function subscribeToPinnedMessage(contactUid) {
    if (state.pinnedMessageRef) {
      state.pinnedMessageRef.off();
      state.pinnedMessageRef = null;
    }
    if (!state.currentUser || !contactUid) return;

    const chatId = generateChatId(state.currentUser.uid, contactUid);
    state.pinnedMessageRef = rtdb.ref(`chats/${chatId}/pinnedMessage`);

    state.pinnedMessageRef.on('value', (snap) => {
      const pin = snap.val();
      state.pinnedMessage = pin;
      if (pin && (pin.text || pin.imageUrl || pin.audioUrl)) {
        if (elements.pinnedMessageBar) elements.pinnedMessageBar.classList.remove('hidden');
        if (elements.pinnedSender) elements.pinnedSender.textContent = pin.senderName || 'Pinned';
        if (elements.pinnedText) {
          elements.pinnedText.textContent = pin.text || (pin.imageUrl ? '📷 Photo' : '🎤 Voice message');
        }
      } else {
        if (elements.pinnedMessageBar) elements.pinnedMessageBar.classList.add('hidden');
      }
    });
  }

  async function pinMessage(msgKey, msg) {
    if (!state.currentUser || !state.activeContact || !msgKey) return;
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    try {
      await rtdb.ref(`chats/${chatId}/pinnedMessage`).set({
        id: msgKey,
        senderName: msg.senderName || 'User',
        text: (msg.text || (msg.imageUrl ? '📷 Photo' : '🎤 Voice message')).slice(0, 100),
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      showToast('Message pinned to conversation!', 'success');
    } catch (err) {
      showToast('Failed to pin message: ' + err.message, 'error');
    }
  }

  async function unpinCurrentMessage() {
    if (!state.currentUser || !state.activeContact) return;
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    try {
      await rtdb.ref(`chats/${chatId}/pinnedMessage`).remove();
      showToast('Message unpinned', 'info');
    } catch (err) {
      showToast('Failed to unpin message: ' + err.message, 'error');
    }
  }

  function jumpToMessage(msgKey) {
    if (!msgKey || !elements.messagesContainer) return;
    const target = elements.messagesContainer.querySelector(`[data-key="${msgKey}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('search-match');
      setTimeout(() => {
        target.classList.remove('search-match');
      }, 2000);
    } else {
      showToast('Original message not found in view', 'info');
    }
  }

  // --------------------------------------------------------------------------
  // Message Reactions & Unsend
  // --------------------------------------------------------------------------
  async function toggleReaction(messageKey, emoji) {
    if (!state.currentUser || !state.activeContact || !messageKey) return;
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    const reactionRef = rtdb.ref(`chats/${chatId}/messages/${messageKey}/reactions/${emoji}/${state.currentUser.uid}`);

    try {
      const snap = await reactionRef.once('value');
      if (snap.exists() && snap.val() === true) {
        await reactionRef.remove();
      } else {
        await reactionRef.set(true);
      }
    } catch (err) {
      console.warn('Could not toggle reaction:', err);
    }
  }

  async function deleteMessage(messageKey) {
    if (!state.currentUser || !state.activeContact || !messageKey) return;
    const confirmed = window.confirm('Delete this message for everyone?');
    if (!confirmed) return;

    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    try {
      await rtdb.ref(`chats/${chatId}/messages/${messageKey}`).update({
        deleted: true,
        text: '',
        imageUrl: null,
        audioUrl: null,
        deletedAt: firebase.database.ServerValue.TIMESTAMP
      });
      showToast('Message deleted', 'info');
    } catch (err) {
      showToast('Failed to delete message: ' + err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // Quoted Message Replies (v1.4.0)
  // --------------------------------------------------------------------------
  function startReplyingTo(msgKey, msg) {
    const isSent = msg.senderId === state.currentUser?.uid;
    const sender = isSent ? 'You' : (msg.senderName || state.activeContact?.displayName || 'User');
    const textSnippet = (msg.text || (msg.imageUrl ? '📷 Photo' : (msg.audioUrl ? '🎤 Voice message' : 'Message'))).slice(0, 80);

    state.replyingTo = {
      id: msgKey,
      senderName: sender,
      text: textSnippet
    };

    if (elements.replyPreviewBar) {
      elements.replyPreviewBar.classList.remove('hidden');
    }
    if (elements.replyToName) {
      elements.replyToName.textContent = sender;
    }
    if (elements.replyToText) {
      elements.replyToText.textContent = textSnippet;
    }
    elements.messageInput?.focus();
  }

  function cancelReplying() {
    state.replyingTo = null;
    if (elements.replyPreviewBar) {
      elements.replyPreviewBar.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Image Compression & Sharing (v1.4.0)
  // --------------------------------------------------------------------------
  function processImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided.'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('File size exceeds the 15MB limit. Please choose a smaller image.'));
        return;
      }
      if (!file.type || !file.type.startsWith('image/')) {
        reject(new Error('Selected file is not an image.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          // Fill with clean white background to prevent alpha channels turning black in JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  function processAvatarFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided.'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('File size exceeds the 15MB limit. Please choose a smaller image.'));
        return;
      }
      if (!file.type || !file.type.startsWith('image/')) {
        reject(new Error('Selected file is not an image.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Crop square thumbnail centered
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          const targetDim = 200; // 200x200 provides retina-sharp avatar while keeping payload small (~8-12KB)

          const canvas = document.createElement('canvas');
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetDim, targetDim);
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  function showImagePreview(dataUrl) {
    state.attachedImage = dataUrl;
    if (elements.imagePreviewThumb) {
      elements.imagePreviewThumb.src = dataUrl;
    }
    if (elements.imagePreviewTray) {
      elements.imagePreviewTray.classList.remove('hidden');
    }
  }

  function clearAttachedImage() {
    state.attachedImage = null;
    if (elements.imagePreviewThumb) {
      elements.imagePreviewThumb.src = '';
    }
    if (elements.imagePreviewTray) {
      elements.imagePreviewTray.classList.add('hidden');
    }
    if (elements.imageFileInput) {
      elements.imageFileInput.value = '';
    }
  }

  function openImageLightbox(url) {
    if (!elements.imageModal || !elements.imageModalImg) return;
    elements.imageModalImg.src = url;
    elements.imageModal.classList.remove('hidden');
  }

  function closeImageLightbox() {
    if (elements.imageModal) {
      elements.imageModal.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Document Attachment & Sharing (v1.4.6)
  // --------------------------------------------------------------------------
  async function processDocFile(file) {
    if (!file) throw new Error('No file selected.');
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File exceeds the 15MB limit. Please choose a smaller file.');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          dataUrl: e.target.result,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type || 'application/octet-stream'
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  function showDocPreview(docObj) {
    state.attachedDoc = docObj;
    if (elements.docPreviewTray) {
      if (elements.docPreviewName) elements.docPreviewName.textContent = docObj.name;
      if (elements.docPreviewSize) elements.docPreviewSize.textContent = docObj.size;
      elements.docPreviewTray.classList.remove('hidden');
    }
  }

  function clearAttachedDoc() {
    state.attachedDoc = null;
    if (elements.docPreviewTray) {
      elements.docPreviewTray.classList.add('hidden');
    }
    if (elements.docFileInput) {
      elements.docFileInput.value = '';
    }
  }

  // --------------------------------------------------------------------------
  // Message Editing Logic (v1.4.6)
  // --------------------------------------------------------------------------
  function startEditingMessage(msgKey, msg) {
    state.editingMessage = { key: msgKey, text: msg.text || '' };
    cancelReplying();
    if (elements.editPreviewBar && elements.editPreviewText) {
      elements.editPreviewText.textContent = msg.text || '';
      elements.editPreviewBar.classList.remove('hidden');
    }
    if (elements.messageInput) {
      elements.messageInput.value = msg.text || '';
      elements.messageInput.focus();
    }
  }

  function cancelEditing() {
    state.editingMessage = null;
    if (elements.editPreviewBar) {
      elements.editPreviewBar.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Voice Recording & Audio Player (v1.4.0)
  // --------------------------------------------------------------------------
  async function startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Voice recording is not supported on this browser.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.audioStream = stream;

      let options = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          options = { mimeType: 'audio/ogg;codecs=opus' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      state.mediaRecorder = mediaRecorder;
      state.audioChunks = [];
      state.recordingSeconds = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          state.audioChunks.push(e.data);
        }
      };

      mediaRecorder.start(200);

      // Broadcast live recording state
      sendTypingState('recording');

      if (elements.voiceRecordingBar) elements.voiceRecordingBar.classList.remove('hidden');
      if (elements.messageForm) elements.messageForm.classList.add('hidden');
      if (elements.recordingTimer) elements.recordingTimer.textContent = '0:00';

      if (state.recordTimerInterval) clearInterval(state.recordTimerInterval);
      state.recordTimerInterval = setInterval(() => {
        state.recordingSeconds++;
        const mins = Math.floor(state.recordingSeconds / 60);
        const secs = state.recordingSeconds % 60;
        if (elements.recordingTimer) {
          elements.recordingTimer.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      showToast('Microphone access denied or unavailable.', 'error');
    }
  }

  function stopMediaTracks() {
    if (state.audioStream) {
      state.audioStream.getTracks().forEach((track) => track.stop());
      state.audioStream = null;
    }
  }

  function cancelVoiceRecording() {
    sendTypingState(false);
    if (state.recordTimerInterval) {
      clearInterval(state.recordTimerInterval);
      state.recordTimerInterval = null;
    }
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      try { state.mediaRecorder.stop(); } catch (_) {}
    }
    stopMediaTracks();
    state.audioChunks = [];
    state.recordingSeconds = 0;

    if (elements.voiceRecordingBar) elements.voiceRecordingBar.classList.add('hidden');
    if (elements.messageForm) elements.messageForm.classList.remove('hidden');
  }

  async function finishVoiceRecordingAndSend() {
    sendTypingState(false);
    if (!state.mediaRecorder) {
      cancelVoiceRecording();
      return;
    }

    const duration = state.recordingSeconds;
    if (duration < 1) {
      showToast('Audio message too short.', 'warning');
      cancelVoiceRecording();
      return;
    }

    if (state.recordTimerInterval) {
      clearInterval(state.recordTimerInterval);
      state.recordTimerInterval = null;
    }

    state.mediaRecorder.onstop = () => {
      stopMediaTracks();
      const mime = state.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(state.audioChunks, { type: mime });
      const reader = new FileReader();
      reader.onload = async () => {
        const audioDataUrl = reader.result;
        await sendVoiceMessage(audioDataUrl, duration);
      };
      reader.readAsDataURL(blob);

      if (elements.voiceRecordingBar) elements.voiceRecordingBar.classList.add('hidden');
      if (elements.messageForm) elements.messageForm.classList.remove('hidden');
      state.audioChunks = [];
      state.recordingSeconds = 0;
    };

    try {
      state.mediaRecorder.stop();
    } catch (_) {
      cancelVoiceRecording();
    }
  }

  async function sendVoiceMessage(audioDataUrl, duration) {
    if (!state.currentUser || !state.activeContact) return;
    if (state.blockedUsers && state.blockedUsers[state.activeContact.uid]) {
      showToast('You have blocked this contact.', 'warning');
      return;
    }
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    const now = firebase.database.ServerValue.TIMESTAMP;
    const currentSenderName = state.currentUser.displayName || 'User';

    try {
      await rtdb.ref(`chats/${chatId}/metadata`).set({
        participants: [state.currentUser.uid, state.activeContact.uid],
        lastMessage: '🎤 Voice message',
        lastMessageTime: now,
        updatedAt: now
      });

      const msgPayload = {
        senderId: state.currentUser.uid,
        senderName: currentSenderName,
        text: '',
        audioUrl: audioDataUrl,
        audioDuration: duration,
        timestamp: now,
        read: false
      };

      if (state.replyingTo) {
        msgPayload.replyTo = { ...state.replyingTo };
        cancelReplying();
      }

      await rtdb.ref(`chats/${chatId}/messages`).push(msgPayload);

      const recipientUid = state.activeContact.uid;
      if (recipientUid && recipientUid !== state.currentUser.uid) {
        rtdb.ref(`notifications/${recipientUid}`).push({
          chatId: chatId,
          senderId: state.currentUser.uid,
          senderName: currentSenderName,
          text: '🎤 Voice message',
          timestamp: now
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      showToast('Failed to send voice message: ' + err.message, 'error');
    }
  }

  function createVoicePlayerElement(audioUrl, duration, isSent) {
    const container = document.createElement('div');
    container.className = 'voice-msg-player';

    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'btn-voice-play';
    playBtn.textContent = '▶';
    playBtn.title = 'Play voice message';

    const waveform = document.createElement('div');
    waveform.className = 'voice-waveform';

    const fill = document.createElement('div');
    fill.className = 'voice-waveform-fill';
    waveform.appendChild(fill);

    const initialDuration = (duration && duration > 0) ? duration : 0;
    const durationLabel = document.createElement('span');
    durationLabel.className = 'voice-duration';
    const initMins = Math.floor(initialDuration / 60);
    const initSecs = Math.round(initialDuration % 60);
    durationLabel.textContent = `${initMins}:${initSecs < 10 ? '0' : ''}${initSecs}`;

    function getEffectiveDuration() {
      if (isFinite(audio.duration) && audio.duration > 0) {
        return audio.duration;
      }
      return initialDuration > 0 ? initialDuration : 1;
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.currentlyPlayingAudio && state.currentlyPlayingAudio !== audio) {
        state.currentlyPlayingAudio.pause();
      }
      if (audio.paused) {
        audio.play().then(() => {
          state.currentlyPlayingAudio = audio;
          playBtn.textContent = '⏸';
        }).catch((err) => {
          console.warn('Playback error:', err);
        });
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const effDuration = getEffectiveDuration();
      if (effDuration > 0) {
        const pct = Math.min(100, Math.max(0, (audio.currentTime / effDuration) * 100));
        fill.style.width = `${pct}%`;
        const curMins = Math.floor(audio.currentTime / 60);
        const curSecs = Math.floor(audio.currentTime % 60);
        durationLabel.textContent = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`;
      }
    });

    audio.addEventListener('pause', () => {
      playBtn.textContent = '▶';
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
      fill.style.width = '0%';
      const endMins = Math.floor(initialDuration / 60);
      const endSecs = Math.round(initialDuration % 60);
      durationLabel.textContent = `${endMins}:${endSecs < 10 ? '0' : ''}${endSecs}`;
      if (state.currentlyPlayingAudio === audio) {
        state.currentlyPlayingAudio = null;
      }
    });

    waveform.addEventListener('click', (e) => {
      e.stopPropagation();
      const effDuration = getEffectiveDuration();
      if (effDuration <= 0) return;
      const rect = waveform.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pos * effDuration;
    });

    // Voice Speed Toggle (1x, 1.5x, 2x)
    const speedBtn = document.createElement('button');
    speedBtn.type = 'button';
    speedBtn.className = 'voice-speed-btn';
    speedBtn.textContent = '1x';
    speedBtn.title = 'Change playback speed';
    const speeds = [1, 1.5, 2];
    let speedIdx = 0;
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedIdx = (speedIdx + 1) % speeds.length;
      const nextSpeed = speeds[speedIdx];
      audio.playbackRate = nextSpeed;
      speedBtn.textContent = `${nextSpeed}x`;
    });

    container.appendChild(playBtn);
    container.appendChild(waveform);
    container.appendChild(durationLabel);
    container.appendChild(speedBtn);
    return container;
  }

  // --------------------------------------------------------------------------
  // Chat Export (v1.4.0)
  // --------------------------------------------------------------------------
  async function exportChatTranscript() {
    if (!state.currentUser || !state.activeContact) {
      showToast('Please select a conversation first.', 'warning');
      return;
    }
    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);
    try {
      const snap = await rtdb.ref(`chats/${chatId}/messages`).once('value');
      if (!snap.exists()) {
        showToast('No messages in this chat to export.', 'info');
        return;
      }

      const lines = [
        '=================================================================',
        `  QuickChat Conversation Transcript (${APP_VERSION})`,
        `  Between: ${state.currentUser.displayName || 'You'} and ${state.activeContact.displayName}`,
        `  Exported: ${new Date().toLocaleString()}`,
        '=================================================================',
        ''
      ];

      snap.forEach((child) => {
        const m = child.val();
        const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleString() : 'Unknown Time';
        const sender = m.senderName || (m.senderId === state.currentUser.uid ? 'You' : state.activeContact.displayName);
        let content = m.text || '';
        if (m.deleted) content = '[This message was deleted]';
        else if (m.imageUrl && !content) content = '[Photo Attachment]';
        else if (m.audioUrl && !content) content = `[Voice Message - ${m.audioDuration || 0}s]`;
        if (m.replyTo) {
          lines.push(`  ↳ In reply to ${m.replyTo.senderName}: "${m.replyTo.text}"`);
        }
        lines.push(`[${timeStr}] ${sender}: ${content}`);
      });

      const fileContent = lines.join('\n');
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (state.activeContact.displayName || 'chat').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `QuickChat_${safeName}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Chat transcript exported!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export chat: ' + err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // Chat Wallpapers (v1.4.6)
  // --------------------------------------------------------------------------
  function setWallpaper(name) {
    const valid = ['default', 'doodles', 'dots', 'sunset', 'carbon'];
    const selected = valid.includes(name) ? name : 'default';
    state.wallpaper = selected;
    localStorage.setItem('quickchat-wallpaper', selected);

    if (elements.messagesContainer) {
      valid.forEach((w) => {
        if (w !== 'default') elements.messagesContainer.classList.remove(`wallpaper-${w}`);
      });
      if (selected !== 'default') {
        elements.messagesContainer.classList.add(`wallpaper-${selected}`);
      }
    }

    document.querySelectorAll('.wallpaper-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.wallpaper === selected);
    });
  }

  // --------------------------------------------------------------------------
  // Starred / Saved Messages (v1.4.6)
  // --------------------------------------------------------------------------
  function subscribeToStarredMessages(uid) {
    if (state.starredListener) {
      rtdb.ref(`users/${uid}/starred`).off('value', state.starredListener);
    }
    state.starredListener = rtdb.ref(`users/${uid}/starred`).on('value', (snap) => {
      state.starredMessages = snap.val() || {};
      renderStarredModalList(elements.starredSearchInput?.value || '');
      updateStarredBadgesInChat();
    });
  }

  async function toggleStarMessage(msgKey, msg) {
    if (!state.currentUser) return;
    const isStarred = state.starredMessages && !!state.starredMessages[msgKey];
    const starRef = rtdb.ref(`users/${state.currentUser.uid}/starred/${msgKey}`);
    try {
      if (isStarred) {
        await starRef.remove();
        showToast('Message removed from Starred', 'info');
      } else {
        const targetContactUid = state.activeContact?.uid || (msg.senderId === state.currentUser.uid ? state.activeContact?.uid : msg.senderId);
        const contactName = state.activeContact?.displayName || msg.senderName || 'Contact';
        const chatId = generateChatId(state.currentUser.uid, targetContactUid || msg.senderId);
        await starRef.set({
          msgKey: msgKey,
          text: msg.text || '',
          senderName: msg.senderName || 'User',
          senderId: msg.senderId || '',
          timestamp: msg.timestamp || Date.now(),
          chatId: chatId,
          contactUid: targetContactUid || '',
          contactName: contactName,
          imageUrl: msg.imageUrl || null,
          audioUrl: msg.audioUrl || null,
          fileUrl: msg.fileUrl || null,
          fileName: msg.fileName || null
        });
        showToast('Saved to Starred Messages! ⭐', 'success');
      }
    } catch (err) {
      console.error('Error toggling star:', err);
      showToast('Could not star message: ' + err.message, 'error');
    }
  }

  function updateStarredBadgesInChat() {
    if (!elements.messagesContainer) return;
    elements.messagesContainer.querySelectorAll('.message').forEach((msgDiv) => {
      const key = msgDiv.dataset.key;
      if (!key) return;
      const isStarred = state.starredMessages && !!state.starredMessages[key];
      const starBtn = msgDiv.querySelector('.star-btn');
      if (starBtn) {
        starBtn.classList.toggle('active', isStarred);
        starBtn.textContent = isStarred ? '★' : '☆';
        starBtn.title = isStarred ? 'Unstar message' : 'Star message';
      }
      let starBadge = msgDiv.querySelector('.msg-starred-badge');
      if (isStarred) {
        if (!starBadge) {
          const timeRow = msgDiv.querySelector('.message-time-row');
          if (timeRow) {
            starBadge = document.createElement('span');
            starBadge.className = 'msg-starred-badge';
            starBadge.textContent = '⭐';
            starBadge.title = 'Starred message';
            timeRow.appendChild(starBadge);
          }
        }
      } else if (starBadge) {
        starBadge.remove();
      }
    });
  }

  function openStarredModal() {
    if (!elements.starredModal) return;
    if (elements.settingsModal) {
      elements.settingsModal.classList.add('hidden');
    }
    renderStarredModalList(elements.starredSearchInput?.value || '');
    elements.starredModal.classList.remove('hidden');
    elements.starredSearchInput?.focus();
  }

  function closeStarredModal() {
    if (elements.starredModal) {
      elements.starredModal.classList.add('hidden');
    }
  }

  function renderStarredModalList(filter = '') {
    if (!elements.starredMessagesList) return;
    elements.starredMessagesList.innerHTML = '';
    const items = Object.values(state.starredMessages || {});
    const query = filter.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (!query) return true;
      return (item.text && item.text.toLowerCase().includes(query)) ||
             (item.senderName && item.senderName.toLowerCase().includes(query)) ||
             (item.contactName && item.contactName.toLowerCase().includes(query)) ||
             (item.fileName && item.fileName.toLowerCase().includes(query));
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (filtered.length === 0) {
      elements.starredMessagesList.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--color-text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">⭐</div>
          <p style="font-size: 15px; font-weight: 500; color: var(--color-text-secondary);">${query ? 'No matching starred messages' : 'No starred messages yet'}</p>
          <p style="font-size: 13px;">Star important messages, photos, or documents to view them here anytime.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'starred-item';

      const header = document.createElement('div');
      header.className = 'starred-item-header';
      header.innerHTML = `
        <span class="starred-item-sender">${escapeHtml(item.senderName || 'User')} <span style="font-weight: 400; color: var(--color-text-muted); font-size: 12px;">(${escapeHtml(item.contactName || 'Chat')})</span></span>
        <span class="starred-item-time">${formatTime(item.timestamp)} · ${formatDate(item.timestamp)}</span>
      `;

      const textDiv = document.createElement('div');
      textDiv.className = 'starred-item-text';

      let contentSnippet = '';
      if (item.text) contentSnippet += linkify(item.text);
      if (item.imageUrl) contentSnippet += `<div style="margin-top: 6px;"><img src="${item.imageUrl}" style="max-height: 80px; border-radius: 6px;" alt="Starred photo"></div>`;
      if (item.fileUrl) contentSnippet += `<div style="margin-top: 6px; font-size: 13px;">📄 <strong>${escapeHtml(item.fileName || 'Document')}</strong></div>`;
      if (item.audioUrl) contentSnippet += `<div style="margin-top: 6px; font-size: 13px;">🎤 <em>Voice message</em></div>`;
      textDiv.innerHTML = contentSnippet || '<em>Attachment</em>';

      const actions = document.createElement('div');
      actions.className = 'starred-item-actions';

      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'starred-jump-btn';
      jumpBtn.textContent = 'Go to message';
      jumpBtn.addEventListener('click', () => {
        closeStarredModal();
        if (item.contactUid) {
          const contact = state.users.find((u) => u.uid === item.contactUid);
          if (contact) {
            selectContact(contact);
            setTimeout(() => jumpToMessage(item.msgKey), 400);
            return;
          }
        }
        jumpToMessage(item.msgKey);
      });

      const unstarBtn = document.createElement('button');
      unstarBtn.type = 'button';
      unstarBtn.className = 'starred-unstar-btn';
      unstarBtn.textContent = 'Unstar';
      unstarBtn.addEventListener('click', () => {
        toggleStarMessage(item.msgKey, item);
      });

      actions.appendChild(jumpBtn);
      actions.appendChild(unstarBtn);

      card.appendChild(header);
      card.appendChild(textDiv);
      card.appendChild(actions);

      elements.starredMessagesList.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // Message Forwarding (v1.4.6)
  // --------------------------------------------------------------------------
  function openForwardModal(msg) {
    if (!elements.forwardModal) return;
    state.forwardingMessage = msg;
    const snippet = msg.text || (msg.imageUrl ? '📷 Photo' : (msg.audioUrl ? '🎤 Voice message' : (msg.fileName ? `📄 ${msg.fileName}` : 'Message')));
    if (elements.forwardPreviewSnippet) {
      elements.forwardPreviewSnippet.textContent = snippet;
    }
    if (elements.forwardSearchInput) {
      elements.forwardSearchInput.value = '';
    }
    renderForwardContactList('');
    elements.forwardModal.classList.remove('hidden');
    elements.forwardSearchInput?.focus();
  }

  function closeForwardModal() {
    if (elements.forwardModal) {
      elements.forwardModal.classList.add('hidden');
    }
    state.forwardingMessage = null;
  }

  function renderForwardContactList(filter = '') {
    if (!elements.forwardContactList) return;
    elements.forwardContactList.innerHTML = '';
    const query = filter.trim().toLowerCase();
    const contacts = (state.users || []).filter((u) => {
      if (!query) return true;
      const name = (u.displayName || u.email || '').toLowerCase();
      return name.includes(query);
    });

    if (contacts.length === 0) {
      elements.forwardContactList.innerHTML = `
        <li style="text-align: center; padding: 20px 8px; color: var(--color-text-muted); font-size: 13px;">
          No contacts found.
        </li>
      `;
      return;
    }

    contacts.forEach((contact) => {
      const li = document.createElement('li');
      li.className = 'forward-contact-item';

      const left = document.createElement('div');
      left.className = 'forward-contact-left';

      const avatar = document.createElement('div');
      avatar.className = 'avatar avatar-sm';
      if (contact.photoURL) {
        avatar.style.backgroundImage = `url(${contact.photoURL})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      } else {
        avatar.textContent = generateAvatar(contact.displayName || contact.email);
        avatar.style.backgroundColor = getAvatarColor(contact.uid);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'forward-contact-name';
      nameSpan.textContent = contact.displayName || contact.email;

      left.appendChild(avatar);
      left.appendChild(nameSpan);

      const sendBtn = document.createElement('button');
      sendBtn.type = 'button';
      sendBtn.className = 'forward-send-btn';
      sendBtn.textContent = 'Send';
      sendBtn.addEventListener('click', () => {
        forwardMessageToContact(contact);
      });

      li.appendChild(left);
      li.appendChild(sendBtn);
      elements.forwardContactList.appendChild(li);
    });
  }

  async function forwardMessageToContact(contact) {
    if (!state.currentUser || !state.forwardingMessage || !contact) return;
    const msg = state.forwardingMessage;
    const targetChatId = generateChatId(state.currentUser.uid, contact.uid);
    const now = firebase.database.ServerValue.TIMESTAMP;
    const currentSenderName = state.currentUser.displayName || 
                              (elements.currentUserName && elements.currentUserName.textContent !== 'Loading user...' ? elements.currentUserName.textContent : null) || 
                              (state.currentUser.email ? state.currentUser.email.split('@')[0] : 'User');

    const previewText = `⏩ ${msg.text || (msg.imageUrl ? '📷 Photo' : (msg.audioUrl ? '🎤 Voice message' : (msg.fileName ? `📄 ${msg.fileName}` : 'Message')))}`;

    try {
      await rtdb.ref(`chats/${targetChatId}/metadata`).set({
        participants: [state.currentUser.uid, contact.uid],
        lastMessage: previewText,
        lastMessageTime: now,
        updatedAt: now
      });

      const payload = {
        senderId: state.currentUser.uid,
        senderName: currentSenderName,
        text: msg.text || '',
        forwarded: true,
        timestamp: now,
        read: false
      };
      if (msg.imageUrl) payload.imageUrl = msg.imageUrl;
      if (msg.audioUrl) {
        payload.audioUrl = msg.audioUrl;
        payload.audioDuration = msg.audioDuration || 0;
      }
      if (msg.fileUrl) {
        payload.fileUrl = msg.fileUrl;
        payload.fileName = msg.fileName || 'file';
        payload.fileSize = msg.fileSize || '';
        payload.fileType = msg.fileType || '';
      }

      await rtdb.ref(`chats/${targetChatId}/messages`).push(payload);

      if (contact.uid !== state.currentUser.uid) {
        rtdb.ref(`notifications/${contact.uid}`).push({
          chatId: targetChatId,
          senderId: state.currentUser.uid,
          senderName: currentSenderName,
          text: previewText,
          timestamp: now
        }).catch(() => {});
      }

      closeForwardModal();
      showToast(`Message forwarded to ${contact.displayName || 'contact'}!`, 'success');
    } catch (err) {
      console.error('Error forwarding message:', err);
      showToast('Failed to forward message: ' + err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // User Blocking & Privacy Controls (v1.4.6)
  // --------------------------------------------------------------------------
  function subscribeToBlockedUsers(uid) {
    if (state.blockedListener) {
      rtdb.ref(`users/${uid}/blocked`).off('value', state.blockedListener);
    }
    state.blockedListener = rtdb.ref(`users/${uid}/blocked`).on('value', (snap) => {
      state.blockedUsers = snap.val() || {};
      updateBlockedStatusUI();
    });
  }

  async function toggleBlockContact() {
    if (!state.currentUser || !state.activeContact) return;
    const contactUid = state.activeContact.uid;
    const isBlocked = !!(state.blockedUsers && state.blockedUsers[contactUid]);
    const blockRef = rtdb.ref(`users/${state.currentUser.uid}/blocked/${contactUid}`);

    try {
      if (isBlocked) {
        await blockRef.remove();
        showToast(`Unblocked ${state.activeContact.displayName}.`, 'info');
      } else {
        if (confirm(`Block ${state.activeContact.displayName}? You will not receive notifications or be able to exchange messages while blocked.`)) {
          await blockRef.set(true);
          showToast(`Blocked ${state.activeContact.displayName}.`, 'warning');
        }
      }
    } catch (err) {
      console.error('Error toggling block state:', err);
      showToast('Failed to update block state: ' + err.message, 'error');
    }
  }

  async function unblockActiveContact() {
    if (!state.currentUser || !state.activeContact) return;
    const contactUid = state.activeContact.uid;
    try {
      await rtdb.ref(`users/${state.currentUser.uid}/blocked/${contactUid}`).remove();
      showToast(`Unblocked ${state.activeContact.displayName}.`, 'info');
    } catch (err) {
      showToast('Failed to unblock: ' + err.message, 'error');
    }
  }

  function updateBlockedStatusUI() {
    if (!state.activeContact) return;
    const isBlocked = !!(state.blockedUsers && state.blockedUsers[state.activeContact.uid]);

    if (elements.blockedBanner) {
      elements.blockedBanner.classList.toggle('hidden', !isBlocked);
    }
    if (elements.blockContactBtn) {
      elements.blockContactBtn.textContent = isBlocked ? '🔓' : '🚫';
      elements.blockContactBtn.title = isBlocked ? 'Unblock contact' : 'Block contact';
    }
    const disabled = isBlocked;
    if (elements.messageInput) elements.messageInput.disabled = disabled;
    if (elements.sendBtn) elements.sendBtn.disabled = disabled;
    if (elements.attachImageBtn) elements.attachImageBtn.disabled = disabled;
    if (elements.attachDocBtn) elements.attachDocBtn.disabled = disabled;
    if (elements.voiceRecordBtn) elements.voiceRecordBtn.disabled = disabled;
  }

  // --------------------------------------------------------------------------
  // Profile & Settings Modal (v1.4.0)
  // --------------------------------------------------------------------------
  function switchSettingsTab(tabName) {
    const isProfile = tabName === 'profile';
    if (elements.settingsTabProfileBtn) {
      elements.settingsTabProfileBtn.classList.toggle('active', isProfile);
      elements.settingsTabProfileBtn.setAttribute('aria-selected', isProfile ? 'true' : 'false');
    }
    if (elements.settingsTabOptionsBtn) {
      elements.settingsTabOptionsBtn.classList.toggle('active', !isProfile);
      elements.settingsTabOptionsBtn.setAttribute('aria-selected', !isProfile ? 'true' : 'false');
    }
    if (elements.settingsProfilePanel) {
      elements.settingsProfilePanel.classList.toggle('hidden', !isProfile);
    }
    if (elements.settingsOptionsPanel) {
      elements.settingsOptionsPanel.classList.toggle('hidden', isProfile);
    }
  }

  function openSettingsModal(defaultTab = 'profile') {
    if (!state.currentUser) return;
    const myData = state.currentUserData || {};
    state.settingsPendingAvatar = state.currentUserPhotoURL || myData.photoURL || (state.currentUser.photoURL && !state.currentUser.photoURL.startsWith('data:') ? state.currentUser.photoURL : null);

    if (elements.settingsDisplayName) {
      elements.settingsDisplayName.value = myData.displayName || state.currentUser.displayName || '';
    }

    if (elements.settingsStatusBio) {
      elements.settingsStatusBio.value = myData.status || '👋 Available';
    }

    if (elements.settingsDesktopNotifs) {
      elements.settingsDesktopNotifs.checked = !!state.desktopNotifsEnabled;
    }
    if (elements.settingsSoundToggle) {
      elements.settingsSoundToggle.checked = !!state.soundEnabled;
    }

    updateSettingsAvatarPreview(state.settingsPendingAvatar, elements.settingsDisplayName?.value || state.currentUser.displayName);

    switchSettingsTab(defaultTab);

    if (elements.settingsModal) {
      elements.settingsModal.classList.remove('hidden');
    }
  }

  function closeSettingsModal() {
    state.settingsPendingAvatar = undefined;
    if (elements.settingsModal) {
      elements.settingsModal.classList.add('hidden');
    }
  }

  function updateSettingsAvatarPreview(photoURL, name) {
    if (!elements.settingsAvatarPreview) return;
    if (photoURL) {
      elements.settingsAvatarPreview.style.backgroundImage = `url(${photoURL})`;
      elements.settingsAvatarPreview.style.backgroundColor = 'transparent';
      elements.settingsAvatarPreview.textContent = '';
    } else {
      elements.settingsAvatarPreview.style.backgroundImage = 'none';
      elements.settingsAvatarPreview.style.backgroundColor = getAvatarColor(state.currentUser?.uid || name);
      elements.settingsAvatarPreview.textContent = generateAvatar(name);
    }
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    const newName = elements.settingsDisplayName?.value.trim();
    const newStatus = elements.settingsStatusBio?.value.trim() || '👋 Available';

    if (!newName) {
      showToast('Display name cannot be empty', 'error');
      return;
    }

    // Sync preferences
    if (elements.settingsSoundToggle) {
      applySoundSetting(elements.settingsSoundToggle.checked);
    }
    if (elements.settingsDesktopNotifs) {
      const wantNotifs = elements.settingsDesktopNotifs.checked;
      if (wantNotifs && !state.desktopNotifsEnabled) {
        requestDesktopNotificationPermission();
      } else {
        applyDesktopNotifSetting(wantNotifs);
      }
    }

    try {
      // 1. Update Firebase Auth Profile (ONLY displayName, never pass data URLs to prevent auth/invalid-profile-attribute)
      const profileUpdate = { displayName: newName };
      if (typeof state.settingsPendingAvatar === 'string' && state.settingsPendingAvatar.length > 0 && !state.settingsPendingAvatar.startsWith('data:') && state.settingsPendingAvatar.length <= 2048) {
        profileUpdate.photoURL = state.settingsPendingAvatar;
      } else if (state.settingsPendingAvatar === '') {
        profileUpdate.photoURL = '';
      }

      try {
        await state.currentUser.updateProfile(profileUpdate);
      } catch (authErr) {
        console.warn('Firebase Auth updateProfile non-critical notice:', authErr);
      }

      // 2. Update Firebase Realtime Database with full profile data and base64 avatar
      const userDbUpdate = {
        displayName: newName,
        status: newStatus,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };
      if (state.settingsPendingAvatar !== undefined) {
        userDbUpdate.photoURL = state.settingsPendingAvatar || null;
      }

      await rtdb.ref(`users/${state.currentUser.uid}`).update(userDbUpdate);

      state.currentUserPhotoURL = state.settingsPendingAvatar || null;
      if (state.currentUserData) {
        state.currentUserData.displayName = newName;
        state.currentUserData.status = newStatus;
        state.currentUserData.photoURL = state.settingsPendingAvatar || null;
      }

      if (elements.currentUserName) {
        elements.currentUserName.textContent = newName;
      }
      updateUserAvatarUI({ ...state.currentUser, displayName: newName, photoURL: state.currentUserPhotoURL });

      closeSettingsModal();
      showToast('Profile and settings updated!', 'success');
    } catch (err) {
      console.error('Error updating settings:', err);
      showToast('Failed to update settings: ' + err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // Message Rendering & Subscription
  // --------------------------------------------------------------------------
  function subscribeToMessages(contactUid) {
    if (state.messagesRef) {
      state.messagesRef.off();
      state.messagesRef = null;
    }
    if (!state.currentUser || !contactUid) return;

    const chatId = generateChatId(state.currentUser.uid, contactUid);
    state.messagesRef = rtdb.ref('chats/' + chatId + '/messages');

    if (elements.messagesContainer) {
      elements.messagesContainer.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--color-text-secondary); font-size: 14px;">
          Loading conversation...
        </div>
      `;
    }

    state.messagesRef.on(
      'value',
      (snapshot) => {
        if (!elements.messagesContainer) return;

        const container = elements.messagesContainer;
        const wasNearBottom = !container || 
          (container.scrollHeight - container.scrollTop - container.clientHeight < 160);
        const previousScrollHeight = container ? container.scrollHeight : 0;
        const previousScrollTop = container ? container.scrollTop : 0;

        elements.messagesContainer.innerHTML = '';

        if (!snapshot.exists()) {
          const emptyNotice = document.createElement('div');
          emptyNotice.className = 'empty-chat-history';
          emptyNotice.style.textAlign = 'center';
          emptyNotice.style.margin = 'auto';
          emptyNotice.style.padding = '32px 16px';
          emptyNotice.style.color = 'var(--color-text-muted)';
          emptyNotice.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 8px;">👋</div>
            <p style="font-size: 15px; font-weight: 500; color: var(--color-text-secondary);">No messages yet</p>
            <p style="font-size: 13px;">Say hello or send a photo to start the chat!</p>
          `;
          elements.messagesContainer.appendChild(emptyNotice);
          hideScrollBottomBtn();
          return;
        }

        let lastDateString = '';
        let firstUnreadEncountered = false;
        const unreadUpdates = {};

        snapshot.forEach((child) => {
          const msg = child.val();
          const msgKey = child.key;
          const timestamp = msg.timestamp;

          // New Unread Messages divider
          if (!firstUnreadEncountered && msg.senderId === contactUid && !msg.read) {
            firstUnreadEncountered = true;
            const unreadDivider = document.createElement('div');
            unreadDivider.className = 'unread-divider';
            unreadDivider.innerHTML = '<span>New Unread Messages</span>';
            elements.messagesContainer.appendChild(unreadDivider);
          }

          // Queue incoming message as read if unread
          if (msg.senderId === contactUid && !msg.read) {
            unreadUpdates[`${msgKey}/read`] = true;
            unreadUpdates[`${msgKey}/readAt`] = firebase.database.ServerValue.TIMESTAMP;
          }

          if (timestamp) {
            const dateStr = formatDate(timestamp);
            if (dateStr && dateStr !== lastDateString) {
              lastDateString = dateStr;
              const dateDivider = document.createElement('div');
              dateDivider.className = 'date-divider';
              dateDivider.style.textAlign = 'center';
              dateDivider.style.margin = '16px 0 8px';
              dateDivider.innerHTML = `
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--color-gray-200); padding: 4px 12px; border-radius: 9999px; color: var(--color-text-secondary);">
                  ${dateStr}
                </span>
              `;
              elements.messagesContainer.appendChild(dateDivider);
            }
          }

          const msgElement = renderMessage(msg, msgKey);
          elements.messagesContainer.appendChild(msgElement);
        });

        // Atomic batch update for all unread message receipts
        if (Object.keys(unreadUpdates).length > 0) {
          rtdb.ref(`chats/${chatId}/messages`).update(unreadUpdates).catch(() => {});
        }

        if (state.chatSearchQuery) {
          applyChatSearch(state.chatSearchQuery);
        } else if (wasNearBottom) {
          scrollToBottom();
          hideScrollBottomBtn();
        } else {
          if (container) {
            container.scrollTop = previousScrollTop + (container.scrollHeight - previousScrollHeight);
          }
          showScrollBottomBtn(true);
        }
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        showToast('Failed to load messages', 'error');
      }
    );
  }

  function renderMessage(msg, msgKey) {
    const isSent = msg.senderId === state.currentUser?.uid;
    const isDeleted = !!msg.deleted;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}${isDeleted ? ' deleted' : ''}`;
    messageDiv.dataset.key = msgKey;
    messageDiv.dataset.text = (msg.text || '').toLowerCase();

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // 0. Forwarded Tag
    if (!isDeleted && msg.forwarded) {
      const fwdTag = document.createElement('div');
      fwdTag.className = 'msg-forwarded-tag';
      fwdTag.innerHTML = '<span>⏩ Forwarded</span>';
      contentDiv.appendChild(fwdTag);
    }

    // 1. Quoted Message Snippet
    if (!isDeleted && msg.replyTo) {
      const quoteDiv = document.createElement('div');
      quoteDiv.className = 'msg-quoted-snippet';
      quoteDiv.title = 'Click to jump to original message';
      quoteDiv.innerHTML = `
        <span class="quote-sender">${escapeHtml(msg.replyTo.senderName || 'User')}</span>
        <span class="quote-text">${escapeHtml(msg.replyTo.text || '')}</span>
      `;
      quoteDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        jumpToMessage(msg.replyTo.id);
      });
      contentDiv.appendChild(quoteDiv);
    }

    // 2. Image Attachment
    if (!isDeleted && msg.imageUrl) {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'msg-image-wrapper';
      const imgEl = document.createElement('img');
      imgEl.src = msg.imageUrl;
      imgEl.alt = 'Shared image';
      imgEl.className = 'msg-image';
      imgEl.loading = 'lazy';
      imgWrapper.appendChild(imgEl);
      imgWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        openImageLightbox(msg.imageUrl);
      });
      contentDiv.appendChild(imgWrapper);
    }

    // 3. Document / File Attachment
    if (!isDeleted && msg.fileUrl) {
      const fileCard = document.createElement('a');
      fileCard.className = 'msg-file-card';
      fileCard.href = msg.fileUrl;
      fileCard.download = msg.fileName || 'attachment';
      fileCard.target = '_blank';
      fileCard.rel = 'noopener noreferrer';
      fileCard.innerHTML = `
        <span class="msg-file-icon">📄</span>
        <div class="msg-file-info">
          <span class="msg-file-name">${escapeHtml(msg.fileName || 'Attachment')}</span>
          <span class="msg-file-size">${escapeHtml(msg.fileSize || '')}</span>
        </div>
        <span class="msg-file-download-icon" title="Download">⬇️</span>
      `;
      contentDiv.appendChild(fileCard);
    }

    // 4. Voice Message
    if (!isDeleted && msg.audioUrl) {
      const voicePlayer = createVoicePlayerElement(msg.audioUrl, msg.audioDuration || 0, isSent);
      contentDiv.appendChild(voicePlayer);
    }

    // 5. Message Text (with safe Linkification)
    if (msg.text || isDeleted) {
      const textSpan = document.createElement('span');
      textSpan.className = 'message-text';
      if (isDeleted) {
        textSpan.textContent = '🚫 This message was deleted';
      } else {
        textSpan.innerHTML = linkify(msg.text);
      }
      contentDiv.appendChild(textSpan);
    }

    // 6. Time, Read Receipts, Edited & Starred Badges
    const timeRow = document.createElement('div');
    timeRow.className = 'message-time-row';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(msg.timestamp);
    timeRow.appendChild(timeSpan);

    if (msg.edited) {
      const editedBadge = document.createElement('span');
      editedBadge.className = 'msg-edited-badge';
      editedBadge.textContent = '(edited)';
      editedBadge.title = msg.editedAt ? `Edited at ${formatTime(msg.editedAt)}` : 'Edited';
      timeRow.appendChild(editedBadge);
    }

    const isStarred = state.starredMessages && !!state.starredMessages[msgKey];
    if (isStarred) {
      const starBadge = document.createElement('span');
      starBadge.className = 'msg-starred-badge';
      starBadge.textContent = '⭐';
      starBadge.title = 'Starred message';
      timeRow.appendChild(starBadge);
    }

    if (isSent && !isDeleted) {
      const ticksSpan = document.createElement('span');
      ticksSpan.className = `msg-ticks${msg.read ? ' read' : ''}`;
      ticksSpan.textContent = msg.read ? '✓✓' : '✓';
      ticksSpan.title = msg.read ? 'Read by recipient' : 'Sent';
      timeRow.appendChild(ticksSpan);
    }

    contentDiv.appendChild(timeRow);
    messageDiv.appendChild(contentDiv);

    // Hover Action Bar (Reactions + Star + Forward + Edit + Copy + Reply + Pin + Delete)
    if (!isDeleted) {
      const actionsBar = document.createElement('div');
      actionsBar.className = 'message-hover-actions';

      // Emoji Reaction buttons
      REACTION_EMOJIS.slice(0, 3).forEach((emoji) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'msg-action-btn';
        btn.textContent = emoji;
        btn.title = `React with ${emoji}`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleReaction(msgKey, emoji);
        });
        actionsBar.appendChild(btn);
      });

      // Star / Bookmark Button
      const starBtn = document.createElement('button');
      starBtn.type = 'button';
      starBtn.className = `msg-action-btn star-btn${isStarred ? ' active' : ''}`;
      starBtn.textContent = isStarred ? '★' : '☆';
      starBtn.title = isStarred ? 'Unstar message' : 'Star message';
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStarMessage(msgKey, msg);
      });
      actionsBar.appendChild(starBtn);

      // Forward Button
      const forwardBtn = document.createElement('button');
      forwardBtn.type = 'button';
      forwardBtn.className = 'msg-action-btn forward-btn';
      forwardBtn.textContent = '⏩';
      forwardBtn.title = 'Forward message';
      forwardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openForwardModal(msg);
      });
      actionsBar.appendChild(forwardBtn);

      // Edit Button (sent messages with text only)
      if (isSent && msg.text) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'msg-action-btn edit-btn';
        editBtn.textContent = '✏️';
        editBtn.title = 'Edit message';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          startEditingMessage(msgKey, msg);
        });
        actionsBar.appendChild(editBtn);
      }

      // Copy Message Text button
      if (msg.text) {
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'msg-action-btn copy-btn';
        copyBtn.textContent = '📋';
        copyBtn.title = 'Copy text';
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg.text)
              .then(() => showToast('Message copied to clipboard!', 'info'))
              .catch(() => showToast('Failed to copy message', 'error'));
          } else {
            const ta = document.createElement('textarea');
            ta.value = msg.text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Message copied to clipboard!', 'info');
          }
        });
        actionsBar.appendChild(copyBtn);
      }

      // Reply Button
      const replyBtn = document.createElement('button');
      replyBtn.type = 'button';
      replyBtn.className = 'msg-action-btn reply-btn';
      replyBtn.textContent = '↩️';
      replyBtn.title = 'Reply';
      replyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startReplyingTo(msgKey, msg);
      });
      actionsBar.appendChild(replyBtn);

      // Pin Button
      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'msg-action-btn pin-btn';
      pinBtn.textContent = '📌';
      pinBtn.title = 'Pin message';
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pinMessage(msgKey, msg);
      });
      actionsBar.appendChild(pinBtn);

      // Delete Button (sent messages only)
      if (isSent) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'msg-action-btn delete-btn';
        delBtn.textContent = '🗑️';
        delBtn.title = 'Delete message';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteMessage(msgKey);
        });
        actionsBar.appendChild(delBtn);
      }

      messageDiv.appendChild(actionsBar);
    }

    // Reaction Chips below message
    if (!isDeleted && msg.reactions) {
      const reactionsDiv = document.createElement('div');
      reactionsDiv.className = 'message-reactions';

      Object.entries(msg.reactions).forEach(([emoji, usersMap]) => {
        if (!usersMap || typeof usersMap !== 'object') return;
        const count = Object.keys(usersMap).length;
        if (count === 0) return;

        const hasReacted = state.currentUser?.uid && !!usersMap[state.currentUser.uid];

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `reaction-chip${hasReacted ? ' active' : ''}`;
        chip.innerHTML = `<span>${emoji}</span><span>${count}</span>`;
        chip.title = hasReacted ? 'Remove reaction' : `React with ${emoji}`;

        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleReaction(msgKey, emoji);
        });

        reactionsDiv.appendChild(chip);
      });

      if (reactionsDiv.children.length > 0) {
        messageDiv.appendChild(reactionsDiv);
      }
    }

    if (!isDeleted) {
      messageDiv.addEventListener('dblclick', () => {
        startReplyingTo(msgKey, msg);
      });
    }

    return messageDiv;
  }

  // --------------------------------------------------------------------------
  // In-Chat Search
  // --------------------------------------------------------------------------
  function openChatSearch() {
    if (!elements.chatSearchBar) return;
    elements.chatSearchBar.classList.remove('hidden');
    elements.chatSearchInput?.focus();
    if (elements.chatSearchInput) {
      applyChatSearch(elements.chatSearchInput.value);
    }
  }

  function closeChatSearch() {
    state.chatSearchQuery = '';
    state.searchMatches = [];
    state.currentSearchMatchIndex = -1;
    if (elements.chatSearchBar) {
      elements.chatSearchBar.classList.add('hidden');
    }
    if (elements.chatSearchInput) {
      elements.chatSearchInput.value = '';
    }
    if (elements.chatSearchCount) {
      elements.chatSearchCount.textContent = '';
    }
    const allMsgs = elements.messagesContainer?.querySelectorAll('.message');
    allMsgs?.forEach((el) => {
      el.classList.remove('search-match');
      el.classList.remove('current');
    });
  }

  function applyChatSearch(query) {
    state.chatSearchQuery = query.trim().toLowerCase();
    const allMsgs = elements.messagesContainer?.querySelectorAll('.message');
    if (!allMsgs) return;

    allMsgs.forEach((el) => {
      el.classList.remove('search-match');
      el.classList.remove('current');
    });
    state.searchMatches = [];
    state.currentSearchMatchIndex = -1;

    if (!state.chatSearchQuery) {
      if (elements.chatSearchCount) elements.chatSearchCount.textContent = '';
      return;
    }

    allMsgs.forEach((msgEl) => {
      const text = msgEl.dataset.text || '';
      if (text.includes(state.chatSearchQuery)) {
        msgEl.classList.add('search-match');
        state.searchMatches.push(msgEl);
      }
    });

    const matchCount = state.searchMatches.length;
    if (matchCount > 0) {
      state.currentSearchMatchIndex = 0;
      updateSearchMatchFocus();
    } else {
      if (elements.chatSearchCount) {
        elements.chatSearchCount.textContent = 'No matches';
      }
    }
  }

  function updateSearchMatchFocus() {
    const total = state.searchMatches.length;
    if (total === 0 || state.currentSearchMatchIndex < 0) {
      if (elements.chatSearchCount) elements.chatSearchCount.textContent = 'No matches';
      return;
    }

    state.searchMatches.forEach((el, idx) => {
      if (idx === state.currentSearchMatchIndex) {
        el.classList.add('current');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        el.classList.remove('current');
      }
    });

    if (elements.chatSearchCount) {
      elements.chatSearchCount.textContent = `${state.currentSearchMatchIndex + 1} of ${total}`;
    }
  }

  function goToNextSearchMatch() {
    if (state.searchMatches.length === 0) return;
    state.currentSearchMatchIndex = (state.currentSearchMatchIndex + 1) % state.searchMatches.length;
    updateSearchMatchFocus();
  }

  function goToPrevSearchMatch() {
    if (state.searchMatches.length === 0) return;
    state.currentSearchMatchIndex = (state.currentSearchMatchIndex - 1 + state.searchMatches.length) % state.searchMatches.length;
    updateSearchMatchFocus();
  }

  // --------------------------------------------------------------------------
  // Emoji Picker Drawer
  // --------------------------------------------------------------------------
  function initEmojiGrid() {
    if (!elements.emojiGrid) return;
    elements.emojiGrid.innerHTML = '';
    POPULAR_EMOJIS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item';
      btn.textContent = emoji;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        insertEmoji(emoji);
      });
      elements.emojiGrid.appendChild(btn);
    });
  }

  function toggleEmojiDrawer() {
    if (!elements.emojiDrawer) return;
    elements.emojiDrawer.classList.toggle('hidden');
  }

  function closeEmojiDrawer() {
    elements.emojiDrawer?.classList.add('hidden');
  }

  function insertEmoji(emoji) {
    if (!elements.messageInput) return;
    const input = elements.messageInput;
    const start = (typeof input.selectionStart === 'number') ? input.selectionStart : input.value.length;
    const end = (typeof input.selectionEnd === 'number') ? input.selectionEnd : input.value.length;
    const val = input.value;
    input.value = val.substring(0, start) + emoji + val.substring(end);
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
    handleTypingInput();
  }

  // --------------------------------------------------------------------------
  // Send Message
  // --------------------------------------------------------------------------
  async function sendMessage() {
    if (!elements.messageInput) return;
    const text = elements.messageInput.value.trim();
    const hasImage = !!state.attachedImage;
    const hasDoc = !!state.attachedDoc;

    if (!text && !hasImage && !hasDoc) return;
    if (!state.currentUser || !state.activeContact) {
      showToast('Please select a contact first', 'error');
      return;
    }

    // Check if recipient is blocked
    if (state.blockedUsers && state.blockedUsers[state.activeContact.uid]) {
      showToast('You have blocked this contact.', 'warning');
      return;
    }

    const chatId = generateChatId(state.currentUser.uid, state.activeContact.uid);

    // If currently editing a message, submit the edit and exit
    if (state.editingMessage) {
      const newText = elements.messageInput.value.trim();
      if (!newText) {
        showToast('Edited message cannot be empty', 'warning');
        return;
      }
      const editingKey = state.editingMessage.key;
      cancelEditing();
      elements.messageInput.value = '';
      sendTypingState(false);
      try {
        await rtdb.ref(`chats/${chatId}/messages/${editingKey}`).update({
          text: newText,
          edited: true,
          editedAt: firebase.database.ServerValue.TIMESTAMP
        });
        showToast('Message edited', 'success');
      } catch (err) {
        console.error('Error updating message:', err);
        showToast('Failed to edit message', 'error');
      }
      return;
    }

    elements.messageInput.value = '';
    elements.messageInput.focus();
    closeEmojiDrawer();
    sendTypingState(false);

    const imageToSend = state.attachedImage;
    const docToSend = state.attachedDoc;
    clearAttachedImage();
    clearAttachedDoc();

    try {
      const now = firebase.database.ServerValue.TIMESTAMP;
      const previewText = text || (imageToSend ? '📷 Photo' : (docToSend ? `📄 ${docToSend.name}` : 'Message'));

      await rtdb.ref('chats/' + chatId + '/metadata').set({
        participants: [state.currentUser.uid, state.activeContact.uid],
        lastMessage: previewText,
        lastMessageTime: now,
        updatedAt: now
      });

      const currentSenderName = state.currentUser.displayName || 
                                (elements.currentUserName && elements.currentUserName.textContent !== 'Loading user...' ? elements.currentUserName.textContent : null) || 
                                (state.currentUser.email ? state.currentUser.email.split('@')[0] : 'User');

      const messagePayload = {
        senderId: state.currentUser.uid,
        senderName: currentSenderName,
        text: text,
        timestamp: now,
        read: false
      };

      if (imageToSend) {
        messagePayload.imageUrl = imageToSend;
      }

      if (docToSend) {
        messagePayload.fileUrl = docToSend.dataUrl;
        messagePayload.fileName = docToSend.name;
        messagePayload.fileSize = docToSend.size;
        messagePayload.fileType = docToSend.type;
      }

      if (state.replyingTo) {
        messagePayload.replyTo = { ...state.replyingTo };
        cancelReplying();
      }

      await rtdb.ref('chats/' + chatId + '/messages').push(messagePayload);

      const recipientUid = state.activeContact.uid;
      if (recipientUid && recipientUid !== state.currentUser.uid) {
        rtdb.ref('notifications/' + recipientUid).push({
          chatId: chatId,
          senderId: state.currentUser.uid,
          senderName: currentSenderName,
          text: previewText,
          timestamp: now
        }).catch((err) => {
          console.warn('Could not dispatch in-app notification:', err);
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message: ' + err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // Cleanup Management
  // --------------------------------------------------------------------------
  function unsubscribeAllListeners() {
    if (state.messagesRef) {
      state.messagesRef.off();
      state.messagesRef = null;
    }
    if (state.usersRef) {
      state.usersRef.off();
      state.usersRef = null;
    }
    if (state.contactTypingRef) {
      state.contactTypingRef.off();
      state.contactTypingRef = null;
    }
    if (state.notificationsRef) {
      state.notificationsRef.off();
      state.notificationsRef = null;
    }
    if (state.pinnedMessageRef) {
      state.pinnedMessageRef.off();
      state.pinnedMessageRef = null;
    }
    if (state.connectedListener) {
      rtdb.ref('.info/connected').off('value', state.connectedListener);
      state.connectedListener = null;
    }
    if (state.starredListener && state.currentUser) {
      rtdb.ref(`users/${state.currentUser.uid}/starred`).off('value', state.starredListener);
      state.starredListener = null;
    }
    if (state.blockedListener && state.currentUser) {
      rtdb.ref(`users/${state.currentUser.uid}/blocked`).off('value', state.blockedListener);
      state.blockedListener = null;
    }
    if (state.currentlyPlayingAudio) {
      try { state.currentlyPlayingAudio.pause(); } catch (_) {}
      state.currentlyPlayingAudio = null;
    }
    cancelVoiceRecording();
    cancelReplying();
    cancelEditing();
    clearAttachedImage();
    clearAttachedDoc();
    sendTypingState(false);
    stopTitleFlash();
  }

  // --------------------------------------------------------------------------
  // Authentication Actions
  // --------------------------------------------------------------------------
  async function handleRegister(e) {
    e.preventDefault();
    setAuthError('');

    const name = elements.registerName?.value.trim();
    const email = elements.registerEmail?.value.trim();
    const password = elements.registerPassword?.value;
    const confirmPassword = elements.registerConfirmPassword?.value;

    if (!name) {
      setAuthError('Please enter your display name.');
      return;
    }
    if (!email) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    try {
      elements.registerForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });

      await rtdb.ref('users/' + cred.user.uid).set({
        displayName: name,
        email: email,
        status: '👋 Available',
        online: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      showToast(`Welcome to QuickChat, ${name}!`, 'success');
    } catch (err) {
      setAuthError(mapAuthError(err));
    } finally {
      elements.registerForm?.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');

    const email = elements.loginEmail?.value.trim();
    const password = elements.loginPassword?.value;

    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    try {
      elements.loginForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
      await auth.signInWithEmailAndPassword(email, password);
      showToast('Signed in successfully!', 'success');
    } catch (err) {
      setAuthError(mapAuthError(err));
    } finally {
      elements.loginForm?.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  }

  async function handleGoogleSignIn() {
    setAuthError('');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      elements.googleSigninBtn?.setAttribute('disabled', 'true');
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      const userRef = rtdb.ref('users/' + user.uid);
      const snapshot = await userRef.once('value');
      if (!snapshot.exists()) {
        await userRef.set({
          displayName: user.displayName || user.email.split('@')[0],
          email: user.email,
          status: '👋 Available',
          photoURL: user.photoURL || null,
          online: true,
          lastSeen: firebase.database.ServerValue.TIMESTAMP,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });
      } else {
        await userRef.update({
          online: true,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
      }
      showToast('Signed in with Google!', 'success');
    } catch (err) {
      setAuthError(mapAuthError(err));
    } finally {
      elements.googleSigninBtn?.removeAttribute('disabled');
    }
  }

  async function handleProfileSetup(e) {
    e.preventDefault();
    setProfileError('');

    const displayName = elements.setupDisplayName?.value.trim();
    if (!displayName) {
      setProfileError('Please choose a display name to continue.');
      return;
    }

    if (!state.currentUser) {
      showScreen('auth');
      return;
    }

    try {
      elements.setupContinueBtn?.setAttribute('disabled', 'true');
      await state.currentUser.updateProfile({ displayName: displayName });

      await rtdb.ref('users/' + state.currentUser.uid).update({
        displayName: displayName,
        email: state.currentUser.email,
        status: '👋 Available',
        online: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      setupPresence(state.currentUser.uid);

      if (elements.currentUserName) {
        elements.currentUserName.textContent = displayName;
      }
      updateUserAvatarUI(state.currentUser);

      showScreen('chat');
      startUsersListener();
      startNotificationListener(state.currentUser.uid);
      showToast('Profile created! Start chatting with contacts.', 'success');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      elements.setupContinueBtn?.removeAttribute('disabled');
    }
  }

  async function handleSignOut() {
    if (!state.currentUser) return;
    try {
      const uid = state.currentUser.uid;
      await rtdb.ref('users/' + uid).update({
        online: false,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
      });
      unsubscribeAllListeners();
      await auth.signOut();
      showToast('Signed out successfully.', 'info');
    } catch (err) {
      console.error('Sign out error:', err);
      showToast('Failed to sign out', 'error');
    }
  }

  // --------------------------------------------------------------------------
  // Application Lifecycle & Event Binding
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Auth tabs & forms
    elements.loginTab?.addEventListener('click', () => switchAuthTab('login'));
    elements.registerTab?.addEventListener('click', () => switchAuthTab('register'));
    elements.loginForm?.addEventListener('submit', handleLogin);
    elements.registerForm?.addEventListener('submit', handleRegister);
    elements.googleSigninBtn?.addEventListener('click', handleGoogleSignIn);
    elements.profileForm?.addEventListener('submit', handleProfileSetup);
    elements.signoutBtn?.addEventListener('click', handleSignOut);

    // Theme & Sound Controls
    elements.themeToggleBtn?.addEventListener('click', toggleTheme);
    elements.soundToggleBtn?.addEventListener('click', toggleSoundSetting);

    // Profile & Settings Modal Tabs & Triggers
    elements.settingsTabProfileBtn?.addEventListener('click', () => switchSettingsTab('profile'));
    elements.settingsTabOptionsBtn?.addEventListener('click', () => switchSettingsTab('settings'));
    elements.settingsBtn?.addEventListener('click', () => openSettingsModal('settings'));
    elements.userAvatar?.addEventListener('click', () => openSettingsModal('profile'));
    elements.settingsCloseBtn?.addEventListener('click', closeSettingsModal);
    elements.settingsCancelBtn?.addEventListener('click', closeSettingsModal);
    elements.settingsForm?.addEventListener('submit', handleSettingsSubmit);
    elements.settingsModal?.addEventListener('click', (e) => {
      if (e.target === elements.settingsModal) closeSettingsModal();
    });

    // Status Presets chips in Settings
    document.querySelectorAll('.preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const statusVal = chip.dataset.status;
        if (elements.settingsStatusBio && statusVal) {
          elements.settingsStatusBio.value = statusVal;
        }
      });
    });

    // Avatar upload & reset in Settings
    elements.settingsAvatarUpload?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        try {
          const dataUrl = await processAvatarFile(file);
          state.settingsPendingAvatar = dataUrl;
          updateSettingsAvatarPreview(dataUrl, elements.settingsDisplayName?.value || 'User');
        } catch (err) {
          showToast('Could not process avatar: ' + err.message, 'error');
        }
      }
    });

    elements.settingsAvatarReset?.addEventListener('click', () => {
      state.settingsPendingAvatar = '';
      updateSettingsAvatarPreview('', elements.settingsDisplayName?.value || 'User');
    });

    // Pinned Message actions
    elements.pinnedMsgTrigger?.addEventListener('click', () => {
      if (state.pinnedMessage && state.pinnedMessage.id) {
        jumpToMessage(state.pinnedMessage.id);
      }
    });
    elements.unpinMsgBtn?.addEventListener('click', unpinCurrentMessage);

    // Export Chat transcript
    elements.exportChatBtn?.addEventListener('click', exportChatTranscript);

    // In-Chat Search
    elements.searchChatBtn?.addEventListener('click', openChatSearch);
    elements.chatSearchClose?.addEventListener('click', closeChatSearch);
    elements.chatSearchInput?.addEventListener('input', (e) => {
      applyChatSearch(e.target.value);
    });
    elements.chatSearchPrev?.addEventListener('click', goToPrevSearchMatch);
    elements.chatSearchNext?.addEventListener('click', goToNextSearchMatch);
    elements.chatSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrevSearchMatch();
        } else {
          goToNextSearchMatch();
        }
      }
    });

    // Quoted Reply Cancel
    elements.cancelReplyBtn?.addEventListener('click', cancelReplying);

    // Image Attachment
    elements.attachImageBtn?.addEventListener('click', () => {
      elements.imageFileInput?.click();
    });
    elements.imageFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        try {
          const dataUrl = await processImageFile(file);
          showImagePreview(dataUrl);
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
    elements.removeImageBtn?.addEventListener('click', clearAttachedImage);

    // Clipboard Paste for Images (Ctrl+V)
    window.addEventListener('paste', async (e) => {
      if (!state.activeContact) return;
      const items = (e.clipboardData || window.clipboardData)?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            try {
              const dataUrl = await processImageFile(file);
              showImagePreview(dataUrl);
              showToast('Image attached from clipboard!', 'success');
            } catch (err) {
              showToast('Error pasting image: ' + err.message, 'error');
            }
            break;
          }
        }
      }
    });

    // Fullscreen Image Lightbox
    elements.imageModalClose?.addEventListener('click', closeImageLightbox);
    elements.imageModal?.addEventListener('click', (e) => {
      if (e.target === elements.imageModal) closeImageLightbox();
    });

    // Voice Recording Actions
    elements.voiceRecordBtn?.addEventListener('click', startVoiceRecording);
    elements.cancelVoiceBtn?.addEventListener('click', cancelVoiceRecording);
    elements.sendVoiceBtn?.addEventListener('click', finishVoiceRecordingAndSend);

    // Sidebar search
    elements.userSearch?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderUserList();
    });

    // Message Input typing tracking
    elements.messageInput?.addEventListener('input', handleTypingInput);

    // Send Form
    elements.messageForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage();
    });

    // Emoji Drawer
    elements.emojiPickerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEmojiDrawer();
    });
    elements.emojiDrawerClose?.addEventListener('click', closeEmojiDrawer);

    // Starred Messages Modal
    elements.starredBtn?.addEventListener('click', openStarredModal);
    elements.starredModalClose?.addEventListener('click', closeStarredModal);
    elements.starredModal?.addEventListener('click', (e) => {
      if (e.target === elements.starredModal) closeStarredModal();
    });
    elements.starredSearchInput?.addEventListener('input', (e) => {
      renderStarredModalList(e.target.value);
    });

    // Forward Message Modal
    elements.forwardModalClose?.addEventListener('click', closeForwardModal);
    elements.forwardModal?.addEventListener('click', (e) => {
      if (e.target === elements.forwardModal) closeForwardModal();
    });
    elements.forwardSearchInput?.addEventListener('input', (e) => {
      renderForwardContactList(e.target.value);
    });

    // User Blocking & Privacy Controls
    elements.blockContactBtn?.addEventListener('click', toggleBlockContact);
    elements.unblockBtn?.addEventListener('click', unblockActiveContact);

    // Message Edit Preview Bar Cancel
    elements.cancelEditBtn?.addEventListener('click', cancelEditing);

    // Document / File Attachment
    elements.attachDocBtn?.addEventListener('click', () => {
      elements.docFileInput?.click();
    });
    elements.docFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        try {
          const docObj = await processDocFile(file);
          showDocPreview(docObj);
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
    elements.removeDocBtn?.addEventListener('click', clearAttachedDoc);

    // Chat Wallpapers Preset Chips
    document.querySelectorAll('.wallpaper-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const w = chip.dataset.wallpaper;
        if (w) setWallpaper(w);
      });
    });

    // Close drawers on outside click
    document.addEventListener('click', (e) => {
      if (elements.emojiDrawer && !elements.emojiDrawer.classList.contains('hidden')) {
        if (!elements.emojiDrawer.contains(e.target) && e.target !== elements.emojiPickerBtn) {
          closeEmojiDrawer();
        }
      }
    });

    // Messages scroll and scroll-to-bottom floating button
    elements.messagesContainer?.addEventListener('scroll', handleMessagesScroll);
    elements.scrollBottomBtn?.addEventListener('click', () => {
      scrollToBottom();
      hideScrollBottomBtn();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeEmojiDrawer();
        closeChatSearch();
        closeSettingsModal();
        closeImageLightbox();
        closeStarredModal();
        closeForwardModal();
        cancelReplying();
        cancelEditing();
        return;
      }

      // Quick Search contacts: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        elements.userSearch?.focus();
        elements.userSearch?.select();
        return;
      }

      // Quick In-Chat Search: Ctrl+F / Cmd+F
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        if (state.activeContact) {
          e.preventDefault();
          openChatSearch();
        }
      }
    });

    // Mobile back button & popstate navigation
    elements.backBtn?.addEventListener('click', () => {
      handleBackToContacts();
      if (window.location.hash === '#chat') {
        try { history.back(); } catch (_) {}
      }
    });

    window.addEventListener('popstate', () => {
      if (elements.chatScreen?.classList.contains('mobile-chat-active')) {
        handleBackToContacts();
      }
    });

    // Mobile Virtual Keyboard Viewport Adaptation (Android & iPhone)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (elements.chatScreen?.classList.contains('mobile-chat-active')) {
          scrollToBottom();
        }
      });
    }

    elements.messageInput?.addEventListener('focus', () => {
      if (window.innerWidth <= 768) {
        setTimeout(scrollToBottom, 260);
      }
    });
  }

  function handleBackToContacts() {
    elements.chatScreen?.classList.remove('mobile-chat-active');
    document.body.classList.remove('mobile-chat-active');
    state.activeContact = null;
    unsubscribeAllListeners();
    if (state.currentUser) {
      startUsersListener();
      startNotificationListener(state.currentUser.uid);
      subscribeToStarredMessages(state.currentUser.uid);
      subscribeToBlockedUsers(state.currentUser.uid);
    }
    if (elements.messagesContainer) elements.messagesContainer.innerHTML = '';
    if (elements.chatHeader) elements.chatHeader.classList.add('hidden');
    if (elements.chatInputArea) elements.chatInputArea.classList.add('hidden');
    if (elements.emptyState) {
      elements.emptyState.classList.remove('hidden');
      elements.emptyState.removeAttribute('hidden');
    }
    renderUserList();
  }

  function initApp() {
    cacheElements();
    applyTheme(state.theme);
    applySoundSetting(state.soundEnabled);
    setWallpaper(state.wallpaper);
    initEmojiGrid();
    setupEventListeners();

    // Check version label consistency
    document.querySelectorAll('[data-version]').forEach((el) => {
      el.textContent = APP_VERSION;
    });

    // Default to auth screen initially so UI is never blank
    if (!state.currentUser) {
      showScreen('auth');
    }

    // Authentication State Observer
    auth.onAuthStateChanged((user) => {
      if (user) {
        state.currentUser = user;

        if (!user.displayName) {
          showScreen('profile');
          if (elements.setupDisplayName) {
            elements.setupDisplayName.value = user.email ? user.email.split('@')[0] : '';
            elements.setupDisplayName.focus();
          }
          return;
        }

        setupPresence(user.uid);

        if (elements.currentUserName) {
          elements.currentUserName.textContent = user.displayName || user.email;
        }

        // Preload user data and custom avatar from RTDB
        rtdb.ref('users/' + user.uid).once('value').then((snap) => {
          if (snap.exists()) {
            const data = snap.val();
            state.currentUserData = data;
            state.currentUserPhotoURL = data.photoURL || null;
            if (data.displayName && elements.currentUserName) {
              elements.currentUserName.textContent = data.displayName;
            }
            updateUserAvatarUI({ ...user, displayName: data.displayName || user.displayName, photoURL: data.photoURL || null });
          }
        }).catch(() => {});

        updateUserAvatarUI(user);

        showScreen('chat');
        startUsersListener();
        startNotificationListener(user.uid);
        subscribeToStarredMessages(user.uid);
        subscribeToBlockedUsers(user.uid);
      } else {
        state.currentUser = null;
        state.activeContact = null;
        state.starredMessages = {};
        state.blockedUsers = {};
        unsubscribeAllListeners();

        if (elements.userList) elements.userList.innerHTML = '';
        if (elements.messagesContainer) elements.messagesContainer.innerHTML = '';
        elements.chatScreen?.classList.remove('mobile-chat-active');
        document.body.classList.remove('mobile-chat-active');

        showScreen('auth');
        switchAuthTab('login');
      }
    });
  }

  // Developer Experience (DX) Diagnostic Helper
  window.quickchat = {
    version: APP_VERSION,
    getState: () => ({ ...state }),
    getElements: () => ({ ...elements }),
    pingConnection: () => rtdb.ref('.info/connected').once('value').then((s) => s.val()),
    testNotification: (title = 'QuickChat Test', body = 'This is a test notification.') => {
      sendDesktopNotification(title, body);
      showInAppNotification(title, body, null, null);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
