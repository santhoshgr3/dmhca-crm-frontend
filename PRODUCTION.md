# Production Deployment Configuration
# This file contains environment-specific settings for production deployment

## Environment Variables for Production

### Core API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com

### Application Settings
NEXT_PUBLIC_APP_NAME=DMHCA CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

### Security Configuration
NEXT_PUBLIC_SESSION_TIMEOUT=30
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5

### Performance Settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_CACHE_DURATION=300000

### Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME_UPDATES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS=true

### Localization
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,hi,es,ar

### Third-party Services (Optional - uncomment and configure as needed)
# NEXT_PUBLIC_WHATSAPP_API_KEY=your_whatsapp_api_key
# NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=your_whatsapp_phone_number
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

### Debug (Production - keep disabled)
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_DEV_TOOLS=false

## Build Configuration

### Next.js Configuration
- Set `output: 'standalone'` in next.config.ts for containerized deployments
- Enable `compress: true` for better performance
- Configure proper image optimization domains

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Deployment Checklist

### Pre-deployment
- [ ] Update API_BASE_URL to production backend URL
- [ ] Configure CORS settings on backend for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (Sentry, etc.)

### Backend Requirements
- [ ] Database is configured and accessible
- [ ] All environment variables are set on backend
- [ ] API endpoints are tested and working
- [ ] Authentication system is configured
- [ ] Rate limiting is enabled
- [ ] Security middleware is active

### Frontend Deployment
- [ ] Build passes without errors
- [ ] All environment variables are configured
- [ ] Static assets are optimized
- [ ] Service worker is configured (if needed)
- [ ] Error boundaries are in place

### Post-deployment
- [ ] Health checks are passing
- [ ] Authentication flow works
- [ ] All CRUD operations function correctly
- [ ] Real-time features work (if enabled)
- [ ] Error handling gracefully falls back to mock data
- [ ] Performance monitoring is active
- [ ] User access controls are working

## Monitoring & Maintenance

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Error rate tracking
- User session analytics

### Health Checks
- `/health` endpoint monitoring
- Database connectivity checks
- External service availability
- SSL certificate expiration alerts

### Backup & Recovery
- Database backup strategy
- Configuration backup
- Disaster recovery plan
- Data retention policies

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session management (Redis/database)
- Static asset distribution
- Database read replicas

### Performance Optimization
- API response caching
- Image optimization
- Code splitting
- Lazy loading
- Service worker caching

### Security Hardening
- Regular security audits
- Dependency vulnerability scanning
- Access log monitoring
- Intrusion detection

## Support & Documentation

### User Documentation
- User manual
- Feature guides
- Troubleshooting guides
- FAQ section

### Technical Documentation
- API documentation
- Deployment guides
- Architecture overview
- Database schema

### Maintenance Procedures
- Update procedures
- Backup/restore procedures
- Incident response plan
- User support workflows
