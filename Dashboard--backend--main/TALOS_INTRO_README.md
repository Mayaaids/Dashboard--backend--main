# TALOS 5.0 Counter Intro Component

A futuristic, cinematic intro screen with an animated counter for the TALOS 5.0 system.

## Features

✨ **Cinematic Effects:**
- Dark red gradient background with grid overlay
- Animated radar circles (HUD style)
- Scanning line sweep animation
- Pulsing red glow effect
- Corner data streams

🎬 **Counter Animation:**
- Starts from 0000
- Rapidly counts to 2000+
- Smooth easing (fast-forward then slow-down)
- Glowing brightness effect when complete
- Responsive to completion state

📱 **Responsive Design:**
- Fullscreen overlay
- Tailwind CSS for styling
- Framer Motion for smooth animations

## Installation

### Prerequisites
- React 18+
- Framer Motion
- Tailwind CSS

### Setup

1. **Install dependencies:**
```bash
npm install framer-motion
```

2. **Ensure Tailwind CSS is configured** in your project

3. **Import the component:**
```tsx
import TalosCounterIntro from './TalosCounterIntro';
```

4. **Use as a page/route:**
```tsx
// In your main App.tsx or routing setup
import TalosCounterIntro from './TalosCounterIntro';

export default function App() {
  return <TalosCounterIntro />;
}
```

## Customization

### Change Counter Target
```tsx
const target = 2500; // Change from 2000
```

### Adjust Animation Duration
```tsx
const duration = 4000; // Change from 3000ms (3 seconds)
```

### Modify Colors
Replace color values in tailwind classes:
- `bg-red-600` → `bg-cyan-500` (change HUD color)
- `text-red-500` → `text-green-500` (change counter color)

### Navigation After Complete
```tsx
onClick={() => {
  window.location.href = '/dashboard'; // Change destination
}}
```

## Component Structure

- **Background**: Dark gradient with animated grid
- **HUD Elements**: Radar circles with pulsing animation
- **Scanning Line**: Fast sweep effect across screen
- **Counter**: Easing animation with glow effect
- **Status Text**: Flickering "System Online" indicator
- **Footer**: College branding info
- **Corner Streams**: Live system data display

## Animation Specs

| Element | Duration | Effect |
|---------|----------|--------|
| Grid Background | 20s | Scrolling |
| Radar Circles | 3-4s | Pulsing scale |
| Scanning Line | 3s | Top to bottom |
| Counter | 3s | Cubic ease-in-out |
| Glow Pulse | 2s | After complete |
| Status Text | 1.5s | Flickering opacity |

## Browser Support

Works on all modern browsers with CSS backdrop filters:
- Chrome 76+
- Firefox 103+
- Safari 15+
- Edge 76+

## Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps counter
- GPU-accelerated transforms (scale, rotate)
- Optimized motion values to avoid repaints
- Can handle multiple instances

## Integration with Existing Dashboard

To use as a splash screen before login:

```tsx
// In your routing setup
const [showIntro, setShowIntro] = useState(true);

return showIntro ? (
  <TalosCounterIntro />
) : (
  <LoginPage />
);
```

Or set it as your landing page and let the "ENTER SYSTEM" button redirect.

---

**Created**: January 31, 2026  
**For**: TALOS 5.0 Registration System
