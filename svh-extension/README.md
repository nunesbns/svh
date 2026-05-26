# SVH Chrome Extension

This is the browser extension for the Scriptcase Versioning Hub (SVH). It intercepts code changes in the Scriptcase IDE and sends them to the central API Hub.

## 🚀 Features

- **Automatic Capture**: Detects saves in the Scriptcase IDE (Ctrl+S, button clicks).
- **Context Awareness**: Automatically identifies the project, application, and user.
- **Timeline Sidebar**: View history and diffs directly within the Scriptcase IDE.
- **One-Click Restore**: Restore previous versions of events and libraries.
- **Offline Sync**: Queues snapshots if the API is temporarily unreachable.

## 🛠️ Tech Stack

- **Platform**: Manifest V3
- **Language**: TypeScript
- **UI Framework**: Preact + Tailwind CSS
- **Bundler**: esbuild

## 📦 Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Extension**:
   For development (watch mode):
   ```bash
   npm run watch
   ```
   
   For production build:
   ```bash
   npm run build
   ```
   This will generate the `dist/` folder.

3. **Load into Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top-right corner).
   - Click **Load unpacked** and select the `dist/` folder inside the `svh-extension` directory.

4. **Configuration**:
   - Click the extension icon in your browser toolbar and go to **Options**.
   - Set the **API URL** (e.g., `http://localhost:8080`) and your **API Key** (generated in the SVH Admin Panel).
