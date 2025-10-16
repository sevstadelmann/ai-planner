# Backend Deployment Guide

## Deploying to Production

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Create \`vercel.json\` in the backend directory:
\`\`\`json
{
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/main.py"
    }
  ]
}
\`\`\`

3. Deploy:
\`\`\`bash
vercel --prod
\`\`\`

4. Set environment variables in Vercel dashboard

### Option 2: Docker

1. Create \`Dockerfile\`:
\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

2. Build and run:
\`\`\`bash
docker build -t ai-planner-backend .
docker run -p 8000:8000 --env-file .env ai-planner-backend
\`\`\`

### Option 3: Railway

1. Install Railway CLI:
\`\`\`bash
npm i -g @railway/cli
\`\`\`

2. Initialize and deploy:
\`\`\`bash
railway init
railway up
\`\`\`

3. Set environment variables:
\`\`\`bash
railway variables set OPENAI_API_KEY=your_key
\`\`\`

## Environment Variables

Required variables for production:
- \`SUPABASE_URL\`
- \`SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`DATABASE_URL\`
- \`OPENAI_API_KEY\`
- \`ALLOWED_ORIGINS\` (comma-separated list of frontend URLs)
- \`STRAVA_CLIENT_ID\` (optional)
- \`STRAVA_CLIENT_SECRET\` (optional)

## Performance Optimization

1. **Caching**: Implement Redis for frequently accessed data
2. **Rate Limiting**: Add rate limiting middleware
3. **Connection Pooling**: Configure database connection pool
4. **CDN**: Use CDN for static assets
5. **Monitoring**: Set up error tracking (Sentry) and performance monitoring

## Security Checklist

- [ ] All environment variables are set
- [ ] CORS is configured with specific origins
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database uses SSL connections
- [ ] API keys are rotated regularly
- [ ] Logging is configured (no sensitive data)
- [ ] Error messages don't expose internal details
\`\`\`
