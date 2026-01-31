# Heelar Landing Page - React

This is the complete React conversion of the Heelar landing page, converted exactly from the original index.html file.

## Setup

```bash
npm install
npm run dev
```

The dev server will start at http://localhost:5173

## Build

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Project Structure

```
heelar-react/
├── src/
│   ├── App.jsx         # Complete landing page component (2556 lines)
│   ├── main.jsx        # React entry point
│   └── styles/
│       └── index.css   # Complete CSS (9444 lines - exact copy from original)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Features

All original functionality has been converted to React:

- **Modal System**: useState hooks for modal state, form submission
- **Scroll Animations**: useEffect with IntersectionObserver for reveal animations
- **About Section**: Scene-based scroll transitions with IntersectionObserver
- **Practitioners Section**: Desktop scroll-based + mobile touch carousel
- **Explore Carousel**: Auto-scrolling with drag/touch support
- **Smooth Scrolling**: Anchor link navigation

## Notes

- The CSS is an exact copy from the original HTML file
- All HTML structure preserved exactly as JSX
- Event handlers converted to React patterns (onClick, onSubmit)
- SVG attributes converted to camelCase (strokeWidth, strokeLinecap, etc.)
- Inline styles converted to React style objects

## Deployment

Build and deploy the `dist/` folder to any static hosting:
- Vercel
- Netlify
- AWS S3/CloudFront
- GitHub Pages

