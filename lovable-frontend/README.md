# Lovable.dev Clone - Frontend

A modern React application that recreates the core functionality of Lovable.dev, enabling users to build websites through natural language conversations with AI.

## 🚀 Features

- **Conversational Interface**: Chat with AI to create websites
- **Real-time Generation**: Live website generation with progress indicators  
- **Live Preview**: Instant preview of generated websites
- **Project Management**: Create, edit, and manage multiple projects
- **Export Options**: Download websites as HTML or ZIP files
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 18** with hooks and modern patterns
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **Socket.io** for real-time communication
- **Monaco Editor** for code viewing
- **Framer Motion** for animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_REPLIT_TOKEN=your_replit_token_here
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route components
├── hooks/           # Custom React hooks
├── services/        # API and external services
├── store/           # Zustand stores
├── utils/           # Helper functions
└── styles/          # Global styles
```

## 🔗 Backend Integration

This frontend connects to a Go backend API. Make sure the backend is running on the configured URL.

## 📱 Responsive Design

The application is built mobile-first and works seamlessly across:
- Mobile phones (320px+)
- Tablets (768px+) 
- Desktop computers (1024px+)

## 🎨 Design System

Uses a consistent design system with:
- Primary color: Blue (#3b82f6)
- Secondary color: Slate (#64748b)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

## 🚀 Deployment

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- Railway
- AWS S3 + CloudFront

## 📄 License

MIT License - see LICENSE file for details