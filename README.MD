# 🎵 Music Volume Reminder Chrome Extension

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

## 🚀 Installation

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/your_username/chrome-volume-reminder.git
   ```

2. **Load the Extension in Chrome:**
   - Open Chrome and navigate to:  
     `chrome://extensions/`
   - Enable **Developer mode** (top right corner).
   - Click **Load Unpacked** and select the project folder.

---

## 📸 Screenshots

_Add screenshots here showcasing the popup and how the icon changes depending on the time._

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
