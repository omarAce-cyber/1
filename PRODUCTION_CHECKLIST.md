# Production Deployment Checklist

## 🔐 Security

- [ ] **Change JWT Secret**: Update `JWT_SECRET` in .env to a strong random string (at least 32 characters)
- [ ] **Change Admin Password**: Update `ADMIN_PASSWORD` in .env and reseed admin user
- [ ] **Enable HTTPS**: Configure SSL/TLS certificates
- [ ] **CORS Configuration**: Update allowed origins in server.js
- [ ] **MongoDB Authentication**: Enable MongoDB authentication
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints
- [ ] **Input Sanitization**: Verify all inputs are properly sanitized
- [ ] **File Upload Security**: Configure proper file type validation and size limits

## 🔧 Configuration

- [ ] **Environment Variables**: Set `NODE_ENV=production`
- [ ] **MongoDB URI**: Update to production MongoDB connection string
- [ ] **Client URL**: Update `CLIENT_URL` to production domain
- [ ] **Port Configuration**: Set appropriate production port
- [ ] **Log Configuration**: Set up production logging (Winston, Morgan)
- [ ] **Error Handling**: Ensure no sensitive data in error messages

## 📊 Database

- [ ] **Backup Strategy**: Set up automated database backups
- [ ] **Indexes**: Create appropriate database indexes for performance
- [ ] **Connection Pooling**: Configure MongoDB connection pooling
- [ ] **Migration Scripts**: Prepare data migration scripts if needed

## 🚀 Deployment

- [ ] **Dependencies**: Run `npm ci` for clean install
- [ ] **Build Process**: Ensure all assets are properly built
- [ ] **Process Manager**: Use PM2 or similar for process management
- [ ] **Server Monitoring**: Set up server monitoring (uptime, performance)
- [ ] **Error Tracking**: Integrate error tracking (Sentry, etc.)
- [ ] **Load Balancing**: Configure load balancer if needed

## 📁 File Management

- [ ] **Static Assets**: Configure CDN for static assets if needed
- [ ] **Upload Directory**: Ensure proper permissions on uploads directory
- [ ] **File Storage**: Consider cloud storage (AWS S3, Cloudinary) for images
- [ ] **Backup Uploads**: Set up backup for uploaded files

## 🧪 Testing

- [ ] **API Testing**: Test all API endpoints
- [ ] **User Flow Testing**: Test complete user workflows
- [ ] **Admin Dashboard**: Verify all admin features work
- [ ] **Authentication**: Test login, logout, and token refresh
- [ ] **Product Management**: Test product CRUD operations
- [ ] **Order Processing**: Test order creation and status updates
- [ ] **Performance Testing**: Load test critical endpoints

## 📱 Frontend

- [ ] **API URLs**: Update all API URLs to production
- [ ] **Error Handling**: Proper error messages for users
- [ ] **Loading States**: Implement loading indicators
- [ ] **Mobile Responsiveness**: Test on various devices
- [ ] **Browser Compatibility**: Test on major browsers

## 📈 Performance

- [ ] **Compression**: Enable gzip compression
- [ ] **Caching**: Implement proper caching strategies
- [ ] **Image Optimization**: Optimize uploaded images
- [ ] **Database Queries**: Optimize slow queries
- [ ] **CDN**: Use CDN for static assets

## 📝 Documentation

- [ ] **API Documentation**: Document all API endpoints
- [ ] **Deployment Guide**: Create step-by-step deployment guide
- [ ] **Admin Manual**: Create admin user manual
- [ ] **Troubleshooting Guide**: Document common issues and solutions

## 🔍 Monitoring

- [ ] **Application Logs**: Set up centralized logging
- [ ] **Error Monitoring**: Monitor application errors
- [ ] **Performance Metrics**: Track response times
- [ ] **Database Monitoring**: Monitor database performance
- [ ] **Uptime Monitoring**: Set up uptime checks
- [ ] **Alerts**: Configure alerts for critical issues

## 🔄 Maintenance

- [ ] **Backup Schedule**: Establish regular backup schedule
- [ ] **Update Strategy**: Plan for security updates
- [ ] **Rollback Plan**: Prepare rollback procedures
- [ ] **Maintenance Window**: Schedule regular maintenance windows

## 🎯 Post-Deployment

- [ ] **Seed Data**: Run production data seeding if needed
- [ ] **Admin Account**: Verify admin account works
- [ ] **Test Orders**: Create test orders to verify flow
- [ ] **Email Notifications**: Test email sending if implemented
- [ ] **Payment Gateway**: Test payment integration if implemented
- [ ] **Domain Configuration**: Verify domain is properly configured
- [ ] **SSL Certificate**: Verify SSL certificate is valid

## 📧 Contact & Support

- [ ] **Support Email**: Set up support email
- [ ] **Documentation URL**: Make documentation accessible
- [ ] **Status Page**: Create system status page if needed

---

## Quick Start Commands

```bash
# Production environment setup
export NODE_ENV=production

# Install dependencies
npm ci

# Seed admin user
npm run seed

# Start with PM2
pm2 start server.js --name "nfr-store"
pm2 save
pm2 startup

# View logs
pm2 logs nfr-store

# Monitor application
pm2 monit
```

## Security Best Practices

1. **Never commit .env file** - Always use environment variables
2. **Regular updates** - Keep dependencies up to date
3. **Strong passwords** - Enforce strong password policies
4. **Session management** - Implement proper session handling
5. **API rate limiting** - Prevent abuse
6. **Input validation** - Validate all user inputs
7. **SQL injection prevention** - Use parameterized queries
8. **XSS prevention** - Sanitize user input
9. **CSRF protection** - Implement CSRF tokens
10. **Security headers** - Use helmet.js for security headers
