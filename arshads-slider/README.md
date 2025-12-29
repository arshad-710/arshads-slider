# Arshad's Slider - Deployment Guide 🚀

Follow these steps to host your Webflow App for free and make it work in Webflow Designer.

## Step 1: Host on GitHub (Free)

1.  **Create a Repository**: Go to [GitHub](https://github.com) and create a new public repository named `arshads-slider`.
2.  **Upload Files**: Upload all files from this folder (`index.html`, `extension.js`, `style.css`, `swiper-init.js`, `webflow.json`) to the repository.
3.  **Enable GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Under "Branch", select `main` (or the branch you uploaded to) and click **Save**.
4.  **Get Your URL**: GitHub will give you a URL like `https://your-username.github.io/arshads-slider/`. Copy this URL.

## Step 2: Register in Webflow

1.  Go to your [Webflow Dashboard](https://webflow.com/dashboard/account/apps).
2.  Click **Create new App**.
3.  **Name**: Arshad's Slider.
4.  **Designer Extension**:
    *   Toggle on "Is this a Designer Extension?".
    *   **Extension URL**: Paste your GitHub Pages URL (e.g., `https://your-username.github.io/arshads-slider/`).
5.  **Click Create App**.

## Step 3: Use in Designer

1.  Open any Webflow project.
2.  Go to the **Apps** icon in the left sidebar.
3.  Launch **Arshad's Slider**.
4.  Go to the **Guide** tab in the app.
5.  Paste your GitHub Pages URL into the field and click **Copy Site-Wide Script**.
6.  Paste that script into your **Webflow Site Settings > Custom Code > Footer Code**.

---

### Features:
- ✅ **No Local Setup**: Runs entirely from GitHub.
- ✅ **Completely Free**: Hosting costs $0 via GitHub Pages.
- ✅ **Dynamic & Static**: Full Swiper.js power for manual and CMS content.
- ✅ **Mobile Optimized**: Responsive settings for all devices.

**By Muhammad Arshad Ajmal**
