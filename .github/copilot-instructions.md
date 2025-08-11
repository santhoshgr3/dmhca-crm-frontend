# DMHCA CRM - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a comprehensive Education-focused CRM system for DMHCA (Delhi Medical Healthcare Academy). 

## Key Components and Guidelines:

### Lead Management System:
- Lead object with fields: Lead ID, Name, Email, Country, Phone (with country code), Course, Qualification (mbbs|md|ms|bds|ayush|md/ms|others), Follow-up Date, Status (hot|warm|followup|not interested|junk|fresh|sale), Notes (timestamped, immutable)
- Auto-assignment rules based on region, language, qualification, and distribution algorithms
- Dynamic lead scoring and "Top Leads" queue functionality

### Communication Features:
- WhatsApp Business API integration with unified inbox
- Email integration with templates
- Real-time toast reminders and notifications
- Multi-language support with i18n

### Analytics & Reporting:
- Counselor performance dashboards with metrics
- Funnel and cohort analytics
- Revenue dashboards with charts
- Sales completion workflows

### UI/UX Standards:
- Use Tailwind CSS for styling with consistent design system
- Implement responsive design for mobile and desktop
- Use Headless UI components for accessibility
- Follow modern React patterns with TypeScript
- Use React Hook Form with Zod validation

### Data Management:
- Design for AWS PostgreSQL backend integration
- Implement proper error handling and loading states
- Use React Query or SWR for data fetching
- Implement bulk import/export functionality

### Security & Access:
- Role-based access control implementation
- Secure API endpoint design
- Data encryption considerations

### Technical Stack:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Recharts for data visualization
- React Leaflet for maps
- React i18next for translations

When generating code, ensure:
1. Components are reusable and well-typed
2. Follow Next.js 15 App Router conventions
3. Implement proper error boundaries
4. Use semantic HTML and ARIA attributes
5. Optimize for performance and SEO
6. Include proper loading and empty states
