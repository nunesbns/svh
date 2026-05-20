# Privacy Policy

**Last Updated:** May 20, 2026

This Privacy Policy explains how the **Scriptcase Versioning Hub (SVH)** Chrome Extension processes, collects, and handles data.

---

## 1. Self-Hosted & Private Architecture (No Developer Access)

The Scriptcase Versioning Hub (SVH) extension is a fully self-hosted, open-source tool. 
* **Zero Data Transmission to Developers:** The creators and maintainers of this extension do **not** collect, store, view, or have access to any of your data, code, or personal information.
* **User-Controlled Backend:** All data captured by the extension is sent exclusively to the companion Laravel API server configured by you (or your organization) in the extension's options page. 

---

## 2. Data We Collect and Process

To provide version control and team presence features, the extension captures and processes the following information:

1. **Website Content (Code Snapshots)**:
   * **What is captured:** The source code of your Scriptcase events, PHP methods, and libraries.
   * **When it is captured:** Only when you actively trigger a save action (e.g., pressing `Ctrl+S` or clicking "Save" inside the Scriptcase IDE).
   * **Purpose:** To persist version snapshots and allow you to view diffs and restore previous versions.

2. **User Activity & State**:
   * **What is captured:** The event of saving code, active IDE tab states, and the project/application context currently being edited.
   * **Purpose:** To track snapshots and determine if team members are currently active on the same asset.

3. **Personally Identifiable Information (Scriptcase Login)**:
   * **What is captured:** Your internal Scriptcase username (`user_sc_login`).
   * **Purpose:** To attribute snapshots to the correct author on your team and display active users in the Developer Activity dashboard.

4. **Authentication Credentials (API Key)**:
   * **What is captured:** The developer API Key you input in the options page.
   * **Purpose:** To authenticate the extension's requests with your self-hosted Laravel API server.

---

## 3. Data Transmission and Storage

* **Destination:** Data is transmitted over HTTP/HTTPS directly to the API endpoint URL you specify in the Options page.
* **Storage:** Data is stored in the database (PostgreSQL and Redis) managed by your organization's self-hosted Laravel installation.
* **Offline Cache:** If your Laravel server is temporarily unreachable, snapshots are cached locally in your browser's secure `chrome.storage.local` area and sent once the connection is restored. This cache is cleared immediately after a successful upload.

---

## 4. Third-Party Sharing

We do **not** share, sell, rent, trade, or distribute your information to any third parties. All communication occurs strictly between your browser and your configured server.

---

## 5. Modifications to This Policy

Since this project is open-source and self-hosted, future changes to the codebase will be published to the public repository. We recommend reviewing the repository updates regularly if you update your self-hosted deployment.

---

## 6. Open Source Repository

For full auditability, the entire source code for both the extension and backend is public:
👉 [https://github.com/nunesbns/svh](https://github.com/nunesbns/svh)
