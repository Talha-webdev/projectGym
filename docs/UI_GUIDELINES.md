# UI/UX Guidelines

## Design System

### Colors
```
Background:         #0A0A0A
Surface:            #1A1A1A
Surface-elevated:   #242424
Border:             #2A2A2A
Border-light:       #333333

Primary (Gold):     #D4A853
Primary-hover:      #E5BD6A
Primary-muted:      rgba(212, 168, 83, 0.12)

Text-primary:       #FFFFFF
Text-secondary:     #A0A0A0
Text-muted:         #6B6B6B

Success:            #22C55E
Error:              #EF4444
Warning:            #F59E0B
```

### Typography
- **Headings**: Inter (700/800), Playfair Display (accent headlines)
- **Body**: Inter (400/500)
- **Scale**: h1: clamp(2.5rem,5vw,4.5rem), h2: clamp(1.75rem,3vw,2.75rem), h3: clamp(1.25rem,2vw,1.75rem), body: 1rem, small: 0.875rem

### Spacing
- Section padding: 96px/128px (py-24/py-32)
- Content max-width: 1280px
- Card gap: 24px
- Content padding: 16px mobile / 24px desktop

### Animations (Framer Motion)
```
fade-in:      0→1 opacity, y:20→0, 0.6s ease-out
stagger:      children delay 0.1s
slide-up:     y:40→0, 0.5s
scale-hover:  1.02
gold-glow:    box-shadow gold on CTA hover
```

## Page Layouts
- Home: Full-bleed sections, hero with gradient overlay + CTA
- About: Single column, max-width 900px, before/after split
- Journey: Vertical timeline, alternating left/right cards
- Videos: Header + filter pills + responsive grid (3/2/1 cols)
- Video Detail: Full-width player + sidebar (related) + comments
- Blogs: Same grid pattern as Videos
- Blog Detail: Centered max-width 800px + floating share buttons
- Gallery: Masonry grid (4/3/2 cols) + lightbox
- Pricing: Centered single plan card + FAQ accordion
- Contact: Two-column split (info + form)
- Login/Register: Centered card, max-width 420px
- Profile: Sidebar (30%) + tabbed content (70%)
- Dashboard: Same layout as Profile, membership card hero
- Admin: Fixed sidebar (260px) + scrollable content area

## Responsive Breakpoints
- Mobile: < 640px — single column, hamburger nav
- Tablet: 640–1024px — 2-column grids, collapsed sidebar
- Desktop: > 1024px — full multi-column, sticky elements

## Accessibility
- WCAG 2.1 AA compliant
- All interactive elements have focus-visible gold ring
- `prefers-reduced-motion` disables animations
- Color contrast: text #FFF on surface #1A1A1A = 17.5:1
- Semantic HTML, ARIA labels, keyboard navigation

## Premium Gating Visual Pattern
- Gold "PREMIUM" badge on cards (top-right)
- Gold left border accent on premium items
- Non-member viewing premium content: blurred preview + overlay CTA "Join to Watch"
- Member viewing: full access with subtle gold ownership indicator

## Loading States
- Skeleton shimmer on dark surfaces for grids
- Gold gradient ring spinner for async actions
- Skeleton cards matching actual card dimensions

## Error States
- Inline red validation below form inputs
- Custom 404 page with brand illustration
- Error boundary fallback with retry button
- API error toast notifications (bottom-right, gold accent)
