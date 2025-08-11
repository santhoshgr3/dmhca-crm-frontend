# DMHCA CRM - Delhi Medical Healthcare Academy

A comprehensive Education-focused Customer Relationship Management (CRM) system designed specifically for DMHCA (Delhi Medical Healthcare Academy). This modern web application helps manage leads, communications, analytics, and educational programs for healthcare professionals.

## 🌟 Features

### Lead Management
- **Advanced Lead Object**: Complete lead profiles with ID, name, email, country, phone (with country code), course interest, qualification levels (MBBS|MD|MS|BDS|AYUSH|MD/MS|Others), follow-up dates, status tracking, and timestamped immutable notes
- **Smart Auto-Assignment**: Intelligent lead distribution based on region, language, qualification, and performance metrics using round-robin or performance-based algorithms
- **Real-time Reminders**: Toast notifications and "Today's Calls" dashboard for follow-up management
- **Dynamic Lead Scoring**: AI-powered scoring based on qualification, engagement, and source quality
- **Top Leads Queue**: Priority-based lead management system

### Communication Hub
- **Two-way WhatsApp Business API**: Integrated messaging with unified inbox and template management
- **Email Integration**: SMTP configuration with customizable templates and automated sequences
- **Unified Inbox**: Centralized communication management across all channels
- **Drip Workflows**: Automated nurture campaigns triggered by status and engagement patterns
- **Chatbot Pre-qualification**: AI-powered initial lead qualification

### Analytics & Reporting
- **Counselor Performance**: Comprehensive dashboards tracking contact volume, conversion rates, response times, and revenue metrics
- **Funnel Analytics**: Visual conversion tracking by source, course, country, and campaign
- **Cohort Analysis**: Student progression and retention analytics
- **Revenue Dashboards**: Financial reporting by course, payment type, region, and counselor with monthly/YTD charts

### Sales Management
- **Sale Completion Workflow**: Automated process capturing fees, collection status, and payment type (loan|EMI|full payment)
- **Sales Reporting**: Automated reporting with comprehensive revenue tracking
- **Payment Type Analytics**: Detailed analysis of payment preferences and success rates

### Educational Resources
- **Interactive Hospital Map**: Searchable map with hospital locations, specialties, and course offerings
- **Public Course Catalog**: Comprehensive listing of fellowships, diplomas, and certifications with apply CTAs
- **Hospital Detail Pages**: Complete information including contact details, specialties, and available programs

### Advanced Features
- **Multi-language Support**: Real-time translation for communications and notes with multi-language UI
- **Bulk Operations**: Import/export functionality (CSV/XLSX) with comprehensive data management
- **Global Filtering**: Advanced filters by status, course, qualification, country, and date ranges
- **Role-based Access Control**: Granular permissions with data encryption and full audit logging
- **AI Recommendations**: Predictive lead scoring, next-best-action suggestions, and churn alerts

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Heroicons** for consistent iconography
- **Recharts** for data visualization
- **React Leaflet** for interactive maps
- **React Hook Form** with Zod validation
- **React Hot Toast** for notifications
- **Framer Motion** for animations
- **React i18next** for internationalization

### Backend Integration
- **AWS PostgreSQL** database
- **REST API** architecture
- **Real-time WebSocket** connections
- **JWT Authentication** with role-based access

### Development Tools
- **ESLint** for code quality
- **TypeScript** strict mode
- **Tailwind CSS** with custom design system
- **VS Code** optimized workspace

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS PostgreSQL database (backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dmhca-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_WHATSAPP_API_KEY=your_whatsapp_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup
This frontend is designed to work with an AWS PostgreSQL backend. Ensure your backend API includes the following endpoints:

- `/api/leads` - Lead management
- `/api/counselors` - Counselor management  
- `/api/communications` - WhatsApp/Email integration
- `/api/analytics` - Reporting and dashboards
- `/api/courses` - Course management
- `/api/hospitals` - Hospital directory
- `/api/sales` - Sales tracking
- `/api/auth` - Authentication

## 📱 Application Structure

### Core Pages
- **Dashboard** (`/dashboard`) - KPI overview and today's tasks
- **Leads** (`/leads`) - Lead management and filtering
- **Communications** (`/communications`) - Unified inbox and templates
- **Analytics** (`/analytics`) - Comprehensive reporting dashboards
- **Hospitals** (`/hospitals`) - Interactive map and directory
- **Courses** (`/courses`) - Public course catalog
- **Settings** (`/settings`) - System configuration

### Key Components
- **Layout** - Responsive navigation with dark mode
- **Lead Management** - Advanced filtering and bulk operations
- **Communication Hub** - Multi-channel messaging interface
- **Analytics Dashboards** - Interactive charts and metrics
- **Hospital Maps** - Location-based service directory

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray Scale**: Tailwind CSS grays

### Typography
- **Font**: Inter (system font fallbacks)
- **Sizes**: Responsive typography scale
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- Consistent spacing (4px grid)
- Rounded corners (8px standard)
- Subtle shadows and borders
- Smooth transitions and animations
- Accessible color contrasts

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=your_backend_api_url

# WhatsApp Business API
NEXT_PUBLIC_WHATSAPP_API_KEY=your_whatsapp_key

# Google Maps (for hospital locations)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Localization
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,hi,es,ar
```

### Customization
The application is highly customizable through:
- **Tailwind Config** - Design system customization
- **TypeScript Types** - Data structure definitions
- **API Service** - Backend integration layer
- **Utility Functions** - Shared business logic

## 📊 Analytics Features

### Lead Analytics
- Conversion funnel visualization
- Source performance tracking
- Geographic distribution
- Qualification-based insights

### Counselor Performance
- Individual and team metrics
- Response time analysis
- Conversion rate tracking
- Revenue attribution

### Revenue Reporting
- Course-wise revenue breakdown
- Payment type analysis
- Monthly and YTD trends
- Growth rate calculations

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Manager, Counselor, Viewer)
- Session management with configurable timeouts
- Two-factor authentication support

### Data Protection
- Client-side input validation
- XSS protection
- CSRF protection
- Secure API communication
- Audit logging for all actions

## 🌍 Internationalization

### Supported Languages
- English (en) - Default
- Hindi (hi)
- Spanish (es) 
- Arabic (ar)

### Translation Features
- Real-time communication translation
- Multi-language UI support
- Right-to-left (RTL) layout support
- Contextual language switching

## 📱 Mobile Responsiveness

- **Mobile-first** design approach
- **Touch-friendly** interface elements
- **Responsive** navigation and layouts
- **Optimized** performance for mobile devices

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment
The application is optimized for Vercel deployment with automatic deployments from Git.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Delhi Medical Healthcare Academy (DMHCA).

## 🆘 Support

For technical support or questions about the DMHCA CRM system, please contact:

- **Email**: support@dmhca.edu
- **Documentation**: Internal wiki and API documentation
- **Issue Tracking**: Internal project management system

---

**Built with ❤️ for Healthcare Education Excellence**
