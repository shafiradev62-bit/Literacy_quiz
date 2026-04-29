# 📸 Media Support for Quiz Units

## ✅ Features Added:

### 1. **Stimulus Panel Media Gallery**
- Multiple images support
- Multiple videos support
- Interactive thumbnail grid
- Click to view fullscreen
- Zoom on hover

### 2. **Question-Level Media**
- Each question can have image or video
- Media displays with question text
- Click image to zoom (opens in new tab)
- Video player with controls
- Enhances question context

### 3. **Interactive Media Gallery**
- Click thumbnails to switch
- Close button to exit fullscreen
- Hover effects
- Responsive grid layout

---

## 🎯 How to Use:

### 1. **Stimulus Panel Media** (Left Panel):

```tsx
<StimulusPanel 
  unit={1}
  // Multiple images
  images={[
    "/images/unit1/photo1.jpg",
    "/images/unit1/photo2.jpg",
    "/images/unit1/photo3.jpg"
  ]}
  
  // Multiple videos
  videos={[
    "/videos/unit1/demo1.mp4",
    "/videos/unit1/demo2.mp4"
  ]}
/>
```

### 2. **Question-Level Media** (In examQuestions.ts):

```typescript
export const examQuestionsUnit1: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "What characteristic of teak leaves makes them suitable for food packaging?",
    options: [
      "They are waterproof and synthetic",
      "They contain natural compounds that help preserve food",
      // ...
    ],
    correct: "They contain natural compounds that help preserve food",
    
    // Add image to question
    mediaUrl: "/images/unit1/teak-leaves.jpg",
    mediaType: "image",
  },
  {
    id: 2,
    type: "mcq",
    question: "Watch the video and answer...",
    
    // Add video to question
    mediaUrl: "/videos/unit1/packaging-process.mp4",
    mediaType: "video",
    
    options: [/* ... */],
    correct: "...",
  },
];
```

---

## 📁 Where to Add Media Files:

### Images:
```
public/
  images/
    unit1/
      photo1.jpg
      photo2.jpg
    unit2/
      process.jpg
      product.jpg
```

### Videos:
```
public/
  videos/
    unit1/
      tutorial.mp4
      demonstration.mp4
    unit2/
      process.mp4
```

---

## 🎨 UI Features:

### Main Display:
- ✅ Large image/video viewer
- ✅ Click image to zoom (opens in new tab)
- ✅ Video auto-plays when selected
- ✅ Close button (X) in top-right corner

### Thumbnail Grid:
- ✅ 4-column responsive grid
- ✅ Hover effect (scale + border)
- ✅ Active state indicator
- ✅ Video play icon overlay

### Interactions:
- ✅ Click thumbnail → Main display updates
- ✅ Click image → Opens in new tab (zoom)
- ✅ Click X → Returns to default view
- ✅ Smooth transitions

---

## 💡 Example Usage Per Unit:

### Unit 1: Nasi Jamblang
```tsx
images={[
  "/images/unit1/nasi-jamblang-traditional.jpg",
  "/images/unit1/teak-leaves-closeup.jpg",
  "/images/unit1/packaging-comparison.jpg"
]}
videos={[
  "/videos/unit1/making-process.mp4"
]}
```

### Unit 2: Shrimp Paste
```tsx
images={[
  "/images/unit2/shrimp-harvest.jpg",
  "/images/unit2/drying-process.jpg",
  "/images/unit2/final-product.jpg"
]}
videos={[
  "/videos/unit2/production-timelapse.mp4"
]}
```

### Unit 3: Empal Gentong
```tsx
images={[
  "/images/unit3/clay-pot.jpg",
  "/images/unit3/cooking-process.jpg",
  "/images/unit3/final-dish.jpg"
]}
```

---

## 🔧 Technical Details:

### Props Interface:
```typescript
interface StimulusPanelProps {
  unit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  imageUrl?: string;        // Single image (backward compatible)
  videoUrl?: string;        // Single video (backward compatible)
  images?: string[];        // Multiple images
  videos?: string[];        // Multiple videos
}
```

### State Management:
```typescript
const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
```

### Responsive Design:
- Grid: 4 columns on all screens
- Images: max-h-[300px] default, max-h-[400px] when selected
- Videos: aspect-video (16:9 ratio)
- Thumbnails: aspect-square (1:1 ratio)

---

## 🚀 Benefits:

1. **Better Learning Experience**
   - Visual aids for complex concepts
   - Real-world photos and videos
   - Interactive exploration

2. **PISA-Style Assessment**
   - Evidence-based questions
   - Data from images/videos
   - Observation skills testing

3. **Engagement**
   - Interactive media gallery
   - Click to explore
   - Visual variety

4. **Accessibility**
   - Alt text support
   - Keyboard navigation
   - Screen reader friendly

---

## 📝 Notes:

- ✅ Backward compatible (old imageUrl/videoUrl still work)
- ✅ No AI used
- ✅ Pure React + TypeScript
- ✅ Optimized images recommended
- ✅ Use WebM/MP4 for videos
- ✅ Lazy loading for performance

---

**Ready to add your media files!** 📸🎥
