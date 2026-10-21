# QuickChat 💬

A lightweight, modern, and user-friendly real-time instant messaging web app powered by **Firebase Authentication** and **Firebase Realtime Database**.

---

## ✨ Features (v1.5.1)

- ⚙️ **Settings Tab Organization & Header Streamlining (`v1.5.1`)**:
  - **Clean, Uncluttered Sidebar Header**: Streamlined top sidebar header to display solely the brand and clickable user profile avatar, preventing any header overflow or collisions with the chat header.
  - **Organized Settings Tab Panel**: Consolidated Theme Toggle (`🌙`/`☀️`), Starred Messages Vault (`⭐`), Notification Sound (`🔊`/`🔇`), Desktop Alerts, and Wallpaper picker under a dedicated **Settings** tab inside the Profile & Settings dialog.
  - **Segmented Modal Tabs**: Interactive tab navigation between `👤 Profile` (Name, Avatar, Bio, Status) and `⚙️ Settings` (Preferences & Tools).
  - **Sidebar Footer Quick-Access**: Added quick-access `⚙️` button in the sidebar footer alongside the user avatar click trigger.
- 🎨 **Modern UI/UX Design System Overhaul (`v1.5.0`)**:
  - **Contemporary Typography**: Implemented `Plus Jakarta Sans` geometric sans-serif paired with `Inter` fallback for high readability and digital-native personality.
  - **Electric Indigo & Violet Aesthetic**: Fresh signature colorway featuring `#6366F1` (Indigo 500) to `#4F46E5` (Indigo 600) smooth gradients and subtle atmospheric mesh auras.
  - **Frosted Glassmorphism**: Translucent surfaces with multi-stop backdrop blur (`backdrop-filter: blur(16px)`) across top headers, composer trays, hover action bars, and modal sheets.
  - **Obsidian Dark Mode**: Deep `#090D16` canvas with high-contrast surfaces (`#111726` / `#182032`) and hairline luminescence.
  - **Elevated Asymmetric Bubbles**: Sent messages with smooth gradient glow (`18px 18px 4px 18px`) and received messages with crisp borders and soft shadows.
  - **Floating Micro-Interactions**: Hover lifts (`translateY(-1px)`), squircle action controls, glowing focus halos, and animated status badges.
- 🖼️ **Forward Modal Avatar Overflow & Sizing Fix**:
  - Constrained contact avatars to crisp 36×36px circular frames (`border-radius: 50%`, `overflow: hidden`, `background-size: cover`).
  - Added flex ellipsis protection to prevent contact names from colliding with avatars or send buttons.
- ✏️ **Message Editing (`(edited)` badge)**:
  - Edit previously sent messages directly from the hover action bar (`✏️`).
  - Active edit preview bar above the composer with one-click cancel (`✕`).
  - Edited messages display an `(edited)` timestamp badge to all participants.
- ⭐ **Starred / Saved Messages Vault (`⭐` modal)**:
  - Bookmark essential messages, photos, voice notes, or documents with the `⭐` action.
  - Dedicated Starred Messages modal (`#starred-modal`) accessible from the sidebar header.
  - Real-time search filter and one-click "Go to message" jump directly to the target conversation.
- ⏩ **Message Forwarding (`⏩` contact picker)**:
  - Forward messages, voice notes, photos, and files to any contact in one click.
  - Forward modal (`#forward-modal`) with preview snippet and searchable contact list.
  - Messages display a clean `⏩ Forwarded` attribution tag.
- 🔗 **Clickable Hyperlinks (Safe Linkification)**:
  - URLs in messages automatically convert into safe, clickable links opening in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
  - Protected by strict HTML escaping prior to linkification.
- ⚡ **Voice Note Playback Speed (`1x / 1.5x / 2x` toggle)**:
  - Voice player includes an interactive speed pill cycling through `1x`, `1.5x`, and `2x` playback rates.
- 📎 **Document & File Sharing (`📎 .pdf, .docx, .zip, .txt`)**:
  - Attach documents, PDFs, archives, and spreadsheets via the paperclip button (`📎`).
  - File preview tray with filename, formatted file size, and remove button.
  - Interactive file download cards rendered inside message bubbles with one-click download.
  - Protected with a 15MB client-side size limit.
- 🎙️ **Live "Recording Audio..." Broadcast Indicator**:
  - Broadcaster updates typing state to `'recording'` when holding mic.
  - Recipient header displays an animated *"[User] is recording audio 🎙️..."* indicator.
- 🚫 **User Blocking & Privacy Controls (`🚫` / `🔓`)**:
  - Block or unblock contacts directly from the active chat header (`🚫`).
  - Visual blocked warning banner with one-click unblock button.
  - Mutes background notifications and disables composer inputs while contact is blocked.
- 🎨 **Custom Chat Wallpapers (`🎨` preset switcher)**:
  - Personalize chat background with presets: **Default**, **Doodles**, **Dots**, **Sunset**, and **Carbon**.
  - Accessible in Profile & Settings with immediate preview and `localStorage` persistence.
- 👀 **"New Unread Messages" Divider**:
  - Visual separator bar automatically highlights where unread messages start when opening a conversation.
- 🏷️ **Visible App Versioning (`v1.5.1`)**:
  - Displays version badge in the auth header, sidebar brand, and sidebar footer.
  - Query parameter cache-busters (`?v=1.5.1`) ensure browsers load updated styles and scripts immediately.
- 📱 **Comprehensive Mobile Support (Android & iPhone / iOS)**:
  - **Dynamic Viewport Height (`100dvh`)**: Perfectly sized for mobile browsers (Chrome, Safari) without address-bar jumpiness.
  - **Safe Area Insets**: Notch, Dynamic Island, and iOS bottom home indicator bar support via `env(safe-area-inset-*)`.
  - **iOS Anti-Zoom Protection**: Text inputs sized to prevent Safari's intrusive auto-zoom on focus.
  - **Mobile Virtual Keyboard Adaptation**: Seamless view adjustments via `window.visualViewport` so the message composer stays visible when typing.
  - **PWA Ready**: Web app capable meta tags, touch icons, theme colors, and pull-to-refresh overscroll containment.
  - **Ergonomic Touch Targets**: Minimum 44px tap targets for buttons, back navigation, audio controls, and avatars.
- 🖼️ **Fixed Profile Photo Upload (`Photo URL too long` resolved)**:
  - Custom user avatars are now cropped to centered squares and resized to 200x200 thumbnails via client-side canvas.
  - Avatars are synchronized directly in Firebase Realtime Database (`users/{uid}/photoURL`), bypassing the 2048-character limit of Firebase Auth and preventing `auth/invalid-profile-attribute` errors.
- 📡 **Real-time Connection Status Banner**:
  - Status bar indicates network connection state (`Connecting to QuickChat...` / `Connected!`) with animated transitions.
  - Automatically recovers and notifies when reconnected to Firebase Realtime Database.
- 📜 **Smart Scroll Preservation & Floating Scroll-to-Bottom Button**:
  - Reading older message history is preserved when new messages or reactions arrive (no forced jumping).
  - Floating button with animated **New** badge when incoming messages arrive; jump down with one click.
- 📋 **Copy Message Text & Quick Double-Click to Reply**:
  - One-click copy button (`📋`) in message action bar copies text directly to clipboard with toast confirmation.
  - Double-click any message bubble to immediately start replying.
- 🔍 **Indexed Multi-Match In-Chat Search**:
  - Search conversation history with match counter (`1 of 5`) and **Enter** / **Shift+Enter** navigation.
- 🔔 **Native Desktop Notifications & Sound Chimes**:
  - Web Audio synthesized chime and browser notifications with customizable settings toggles.
- 🟢 **Live Online/Offline Contact Status Indicators**:
  - Real-time `Online` / `Offline` labels under each contact in the sidebar with live presence dots.
- 💬 **Message Read Receipts (✓ / ✓✓)**:
  - Real-time single tick (`✓`) and blue double ticks (`✓✓`) when read.
- ↩️ **Quoted Replies & Pinned Messages**:
  - Quoted reply snippet navigation and pinned conversation banners.
- 📥 **Chat Transcript Export**:
  - Export full conversation transcript to a formatted `.txt` file.
- 🌓 **Dark Mode / Light Mode**:
  - Quick theme toggle (`🌙` / `☀️`) in the sidebar header with `localStorage` persistence.
- ❤️ **Message Emoji Reactions & Emoji Drawer**:
  - React with 👍, ❤️, 😂, 🔥, 😮, 😢 with live synced counters and emoji drawer picker.

---

## 📁 Project Structure

```
quickchat/
├── public/                  # Static web assets
│   ├── index.html           # HTML5 structure, modals, mobile meta tags (v1.5.1)
│   ├── style.css            # Modern UI/UX design tokens, glassmorphism, responsive styles (v1.5.1)
│   └── app.js               # Firebase Auth & Realtime Database logic (v1.5.1)
├── package.json             # NPM scripts (start, check, deploy)
├── firebase.json            # Firebase Hosting & Database configuration
├── database.rules.json      # Firebase Realtime Database security rules
└── README.md                # Documentation and setup guide
```

---

## 🚀 Getting Started

### 1. Run the Application Locally

Using npm:
```bash
npm start
```
Or directly with Python:
```bash
python -m http.server 8000 --directory public
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

### 2. Check JavaScript Syntax

```bash
npm run check
```

---

### 3. Deploy to Firebase Hosting

To deploy your live app and database rules:

```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to your Google account
firebase login

# 3. Deploy to Firebase Hosting and Realtime Database
npm run deploy
```

---

## 🔒 Security Summary

The included [`database.rules.json`](./database.rules.json) guarantees:
- **User profiles** can only be written by the authenticated user matching their own UID (`auth.uid === $uid`).
- **Chats & Messages** require active authentication (`auth != null`).
- **Notifications** can only be read by the recipient user (`auth.uid === $uid`).
