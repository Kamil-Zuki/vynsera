# Vynsera - Korean Language Learning Platform

A comprehensive, static-first Korean language learning website built with Next.js 15+, TypeScript, and Tailwind CSS. Features structured roadmaps, curated resources, and cultural insights for effective Korean language learning.

## 🌟 Features

- **Structured Learning Roadmap**: Step-by-step guide from beginner to advanced Korean proficiency
- **Curated Resources**: Handpicked apps, books, videos, courses, and tools
- **Korean Cultural Insights**: Learn language in cultural context
- **Responsive Design**: Mobile-first design with Korean-inspired aesthetics
- **SEO Optimized**: Built for search engines and social media sharing
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Static-first architecture with CDN optimization
- **Bilingual Support**: English and Korean content

## 🚀 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4.0+
- **Icons**: Lucide React
- **Deployment**: Docker + Nginx on VPS
- **CDN**: Cloudflare (recommended)

## 🎨 Design System

### Color Palette

- **Primary**: Soft Red (#E63946) - Korean-inspired accent color
- **Secondary**: Sage Green (#A8DADC) - Calm, learning-focused
- **Accent**: Warm Gold (#F4A261) - Call-to-action elements
- **Background**: Off-White (#F1FAEE) - Clean, minimal
- **Text**: Navy Blue (#1D3557) - High contrast, readable

### Typography

- **Primary**: Inter (English text)
- **Korean**: Noto Sans KR (Hangul support)
- **Headings**: Poppins (Modern, friendly)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── resources/         # Resources listing page
│   ├── roadmap/          # Learning roadmap page
│   ├── layout.tsx        # Root layout with navigation
│   └── page.tsx          # Homepage
├── components/           # Reusable React components
│   ├── ResourceCard.tsx  # Resource display component
│   ├── RoadmapAccordion.tsx # Interactive roadmap
│   ├── Navigation.tsx    # Site navigation
│   └── Footer.tsx        # Site footer
├── data/                 # Static JSON data
│   ├── resources.json    # Learning resources
│   └── roadmap.json      # Learning roadmap steps
└── types/                # TypeScript type definitions
    └── index.ts          # All type interfaces
```

## 🛠️ Development

### Prerequisites

- Node.js 22+
- npm or yarn
- Docker (for deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/vynsera.git
   cd vynsera
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### VPS Deployment with Docker

1. **Prepare your VPS**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and deploy**

   ```bash
   git clone https://github.com/your-username/vynsera.git
   cd vynsera
   ./deploy.sh
   ```

3. **Configure domain and SSL**
   - Update `nginx.conf` with your domain
   - Place SSL certificates in `ssl/` directory
   - Restart containers: `docker-compose restart`

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SITE_URL=https://vynsera.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, SEO, Accessibility)
- **Core Web Vitals**: LCP <2s, FID <80ms, CLS <0.05
- **Bundle Size**: <400KB initial JS payload
- **Load Time**: <1.5s on 4G networks

## 🔧 Configuration

### Nginx Configuration

The `nginx.conf` file includes:

- SSL/TLS configuration
- Gzip compression
- Security headers
- Rate limiting
- Static file caching
- Reverse proxy to Next.js

### Docker Configuration

- Multi-stage build for optimization
- Alpine Linux for smaller images
- Health checks for reliability
- Non-root user for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Korean language learning community
- Open source contributors
- Design inspiration from Korean cultural elements
- Next.js and Tailwind CSS teams

## 📞 Support

- **Website**: [vynsera.com](https://vynsera.com)
- **Email**: hello@vynsera.com
- **GitHub**: [Issues](https://github.com/your-username/vynsera/issues)
- **Discord**: [Community Server](https://discord.gg/vynsera)

---

Made with ❤️ for the Korean language learning community
