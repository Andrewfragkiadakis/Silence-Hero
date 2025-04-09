# 🇬🇷 Music Volume Reminder Chrome Extension

A Chrome extension that helps you manage your music volume based on Greek quiet hour rules ([Police Order 3 of 1996](https://www.astynomia.gr/odigos-tou-politi/chrisimes-symvoules/diafores/poies-einai-oi-ores-koinis-isychias/)).
It dynamically updates its icon (green for non-quiet hours and red for quiet hours) and provides a handy countdown in a stylish popup with rounded corners and modern UI/UX inspired by Google Chrome’s own design language.

---

## ✨ Features

### ✅ Dynamic Icon  (🟢 / 🔴)
Automatically updates between **red** and **green** based on current time and Greek quiet hour rules.

### 📋 User-Friendly Popup  
Click the extension icon to:
- View whether it's currently a **Quiet Hour** or **Non-Quiet Hour**
- See the exact time remaining until the next state change, displayed in an easy-to-read format (e.g., `01:45:32`)

### ⏰ Smart Time Logic  
Quiet hour rules are automatically calculated based on the date:

- **Summer (April 1 - September 30):**  
  - Midday: **15:00–17:30**  
  - Night: **23:00–07:00**

- **Winter (October 1 - March 31):**  
  - Midday: **15:30–17:30**  
  - Night: **22:00–07:30**

### 🎨 Modern Design  
- Clean, intuitive interface  
- Comfortaa font for a friendly and modern look  
- Earth-toned color palette  
- Rounded corners and responsive layout  
- Inspired by Google Chrome’s own UI language  

---

## Installation

You can install this extension in two ways:

**Method 1: Using Git (Recommended for developers)**

1. **Clone the Repository:** Open your terminal or command prompt and run:
    ```bash
    git clone https://github.com/Andrewfragkiadakis/music-volume-reminder.git
    ```
2.  **Load in Chrome:**
    * Open Google Chrome and navigate to `chrome://extensions/`.
    * Ensure **Developer mode** is enabled (usually a toggle switch in the top-right corner).
    * Click the **Load unpacked** button.
    * In the file browser that opens, navigate to and select the `chrome-volume-reminder` folder that you just cloned. The extension should now appear in your list.

**Method 2: Downloading ZIP File**

1.  **Download the Code:**
    * Go to the main page of the GitHub repository: `https://github.com/Andrewfragkiadakis/music-volume-reminder`
    * Click the green **Code** button.
    * Select **Download ZIP**.
2.  **Extract the ZIP File:**
    * Locate the downloaded ZIP file (e.g., `chrome-volume-reminder-main.zip`) on your computer.
    * Unzip or extract the contents. You should now have a folder named something like `chrome-volume-reminder-main`.
3.  **Load in Chrome:**
    * Open Google Chrome and navigate to `chrome://extensions/`.
    * Ensure **Developer mode** is enabled (usually a toggle switch in the top-right corner).
    * Click the **Load unpacked** button.
    * In the file browser that opens, navigate to and select the extracted folder (e.g., `chrome-volume-reminder-main`). The extension should now appear in your list.

---
## 📸 Screenshots

_Add screenshots here showcasing the popup and how the icon changes depending on the time._

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
