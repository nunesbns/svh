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

## 📦 Development & Build

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
    This will generate the `dist/` folder.
3.  **Watch Mode**:
    ```bash
    npm run watch
    ```

## 📥 Installation

1.  Go to `chrome://extensions/`.
2.  Enable **Developer mode**.
3.  Click **Load unpacked**.
4.  Select the `svh-extension/dist` folder.

## ⚙️ Configuration

Once installed, click on the extension icon and select **Options**. You will need to provide:
- **API URL**: The address of your SVH API Hub.
- **API Key**: Your personal developer API key (generated in the SVH Admin Panel).
