# StyleSphere ✦ Your World. Your Style. Your AI.

> **AI-Powered Personal Lifestyle & Wardrobe Assistant**  
> An editorial, intelligent fashion-tech platform uniting digital wardrobe cataloging, AI outfit curation, Anywear-inspired live webcam virtual try-on, and smart gap-based shopping.

---

## ✨ Key Features

- **👔 My Wardrobe (Garde-Robe Privée)**: Catalog, categorize, and tag your personal clothing collection with dominant color coordinates and silhouette metadata.
- **✨ AI Outfit Studio (Lookbook & AI)**: Interactive flat-lay canvas for styling outfits in real-time with automated color-harmony and occasion etiquette scoring.
- **🪞 Virtual Try-On (Anywear Live Engine)**:
  - **Product Link Parser**: Paste any product URL from Zara, Uniqlo, Myntra, H&M, or ASOS to instantly extract and preview garments.
  - **Live Webcam Fitting**: Streams your webcam in real-time with an AI pose alignment grid (shoulders, torso drape zone) and customizable fabric blend/opacity sliders.
- **🛍️ Smart Shopping**: Detects exact missing silhouette and palette gaps in your closet, curating high-utility partner pieces with exclusive discount code `SPHERE10`.
- **🛋️ Room Makeover (Phase 2 • Coming Soon)**: Spatial AI interior transformer harmonizing bedroom & dressing room decor with your personal wardrobe aesthetic.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🌐 Deploying on Render (Static Site)

1. Connect your GitHub repository to **Render**.
2. Create a new **Static Site**.
3. Set the build configurations:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Important for React Router (Single Page App):**
   - Go to **Redirects/Rewrites** in Render settings:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

---

## 📄 License
Built for Hackathon 2026.
