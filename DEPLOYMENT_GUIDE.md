# 🚀 COMPLETE DEPLOYMENT GUIDE

## **Overview**

You have **3 components** to connect:

1. **✅ Java Backend (Vitality)** - Already deployed on Railway
2. **🔄 AI Backend (imageVideoBackend)** - Python FastAPI (needs deployment)
3. **🌐 Frontend** - Next.js on Vercel at `https://vitality-sliding-window.vercel.app/`

---

## **📋 PART 1: Deploy AI Backend to Railway**

### **1.1 Files Already Configured ✅**

Your AI backend is **ready for deployment**! These files are already set up:

- ✅ `railway.toml` - Railway deployment configuration
- ✅ `nixpacks.toml` - Build configuration with Python 3.11, ffmpeg, libGL
- ✅ `requirements.txt` - Python dependencies
- ✅ CORS already configured to allow all origins

### **1.2 Deploy via Railway CLI (Recommended)**

```bash
# Navigate to AI backend directory
cd imageVideoBackend

# Login to Railway (if not already logged in)
railway login

# Initialize new Railway project
railway init
# When prompted:
# - Enter project name: "vitality-ai-backend" (or your choice)
# - Select "Empty Project"

# Link to the project
railway link

# Deploy
railway up

# Monitor deployment
railway logs
```

### **1.3 Deploy via Railway Dashboard (Alternative)**

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize GitHub and select: `Vitality_Sliding-Window_HackNagpur`
5. **IMPORTANT:** Click **"Add variables"** before deploying
6. Set **Root Directory**: `imageVideoBackend`
7. Railway will auto-detect Python and use nixpacks
8. Click **"Deploy"**

### **1.4 Configure Environment Variables**

After deployment, in Railway Dashboard:

1. Select your **vitality-ai-backend** service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `MODE` | `PRODUCTION` | Switches from DEMO to PRODUCTION detection thresholds |

**Note:** `PORT` is automatically set by Railway

5. Click **"Redeploy"** if changes don't auto-deploy

### **1.5 Generate Public Domain**

1. Railway Dashboard → **vitality-ai-backend** service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Copy the URL (example: `https://vitality-ai-backend-production.up.railway.app`)

**✅ SAVE THIS URL! You'll need it for Vercel configuration.**

### **1.6 Test AI Backend**

Once deployed, test the endpoints:

```bash
# Replace with your Railway URL
AI_BACKEND_URL="https://vitality-ai-backend-production.up.railway.app"

# Test health endpoint
curl $AI_BACKEND_URL/health

# Expected response:
# {"status":"healthy","version":"1.0.0"}

# Test ISA health
curl $AI_BACKEND_URL/isa/health

# View API documentation
open $AI_BACKEND_URL/docs
```

---

## **📋 PART 2: Configure Vercel Frontend**

### **2.1 Required Environment Variables**

Your frontend needs these environment variables:

| Variable Name | Purpose | Source |
|--------------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase database URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard |
| `NEXT_PUBLIC_API_URL` | Java backend URL (REST API) | Railway |
| `NEXT_PUBLIC_WS_URL` | Java backend WebSocket URL | Railway |
| `NEXT_PUBLIC_IMAGE_VIDEO_BACKEND_URL` | AI backend URL | Railway |

### **2.2 Get Your Backend URLs**

#### **Java Backend (Vitality) - Already Deployed:**

1. Railway Dashboard → Select **vitality-backend** service
2. Go to **"Settings"** → **"Networking"**
3. Copy the **public domain** (e.g., `https://vitality-backend-production.up.railway.app`)

**For WebSocket URL:**
- Railway uses `wss://` for WebSocket over HTTPS
- Same domain, different protocol: `wss://vitality-backend-production.up.railway.app`

#### **AI Backend (imageVideoBackend) - Just Deployed:**

Use the URL from Part 1.5 above.

### **2.3 Get Supabase Credentials**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **Vitality** project
3. Click **"Settings"** (gear icon)
4. Go to **"API"** section
5. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **2.4 Add Environment Variables to Vercel**

#### **Option A: Via Vercel Dashboard (Recommended)**

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **vitality-sliding-window** project
3. Go to **"Settings"** tab
4. Click **"Environment Variables"**
5. Add each variable:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Java Backend (Vitality)
NEXT_PUBLIC_API_URL=https://vitality-backend-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://vitality-backend-production.up.railway.app/ws

# AI Backend (Python FastAPI)
NEXT_PUBLIC_IMAGE_VIDEO_BACKEND_URL=https://vitality-ai-backend-production.up.railway.app
```

**For each variable:**
- Enter **Key** (variable name)
- Enter **Value** (the URL or key)
- Select **all environments** (Production, Preview, Development)
- Click **"Save"**

6. After adding all variables, click **"Redeploy"**

#### **Option B: Via Vercel CLI**

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Link to existing project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted, press Enter

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste value

vercel env add NEXT_PUBLIC_API_URL production
# Paste value

vercel env add NEXT_PUBLIC_WS_URL production
# Paste value

vercel env add NEXT_PUBLIC_IMAGE_VIDEO_BACKEND_URL production
# Paste value

# Redeploy
vercel --prod
```

---

## **📋 PART 3: Verify CORS Configuration**

### **3.1 Java Backend CORS ✅**

Already configured in `Vitality/src/main/java/com/example/Vitality/config/CorsConfig.java`:

```java
config.setAllowedOriginPatterns(Arrays.asList("*"));
config.addAllowedHeader("*");
config.addAllowedMethod("*");
```

**Status:** ✅ Ready - Allows all origins including Vercel

### **3.2 AI Backend CORS ✅**

Already configured in `imageVideoBackend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Status:** ✅ Ready - Allows all origins including Vercel

---

## **📋 PART 4: Testing End-to-End Connection**

### **4.1 Test Java Backend from Vercel**

1. Open your Vercel app: `https://vitality-sliding-window.vercel.app`
2. Open **Browser DevTools** (F12)
3. Go to **Console** tab
4. Test API connection:

```javascript
// Test REST API
fetch('https://vitality-backend-production.up.railway.app/api/policies')
  .then(r => r.json())
  .then(console.log)

// Expected: List of policies from your database
```

5. Test WebSocket (if you have a dashboard page):
   - Navigate to the dashboard
   - Check **Network** tab → **WS** filter
   - Should see WebSocket connection to `wss://vitality-backend-production.up.railway.app/ws`

### **4.2 Test AI Backend from Vercel**

1. In your Vercel app, navigate to **Add Patient** page (or wherever image upload is)
2. Open **DevTools** → **Console**
3. Upload an injury image
4. Check **Network** tab → **Fetch/XHR**
5. Should see request to: `https://vitality-ai-backend-production.up.railway.app/isa/analyze`

Or test manually:

```javascript
// Test AI backend health
fetch('https://vitality-ai-backend-production.up.railway.app/health')
  .then(r => r.json())
  .then(console.log)

// Expected: {"status":"healthy","version":"1.0.0"}
```

### **4.3 Common Issues & Fixes**

#### **Issue: CORS Error**

```
Access to fetch at '...' from origin 'https://vitality-sliding-window.vercel.app' 
has been blocked by CORS policy
```

**Fix:**
- Both backends already allow all origins
- If you still see this, redeploy the backend:
  - Railway Dashboard → Service → Click **"Redeploy"**

#### **Issue: 404 Not Found**

```
GET https://vitality-backend-production.up.railway.app/api/policies 404
```

**Fix:**
- Check if the endpoint exists in your Java backend
- Test directly: `curl https://vitality-backend-production.up.railway.app/api/policies`
- Verify Railway deployment logs for errors

#### **Issue: Connection Timeout**

**Fix:**
- Check Railway logs: `railway logs`
- Ensure backend is running and healthy
- Check Railway service status

#### **Issue: Environment Variables Not Loading**

**Fix in Vercel:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Verify all variables are set for **Production** environment
3. Click **"Redeploy"** after changes

---

## **📋 PART 5: Complete Configuration Checklist**

### **Backend 1: Java Backend (Vitality) ✅**

- [x] Deployed to Railway
- [x] Environment variables configured
- [x] CORS allows Vercel domain
- [ ] Public domain generated: `________________`
- [ ] Health check passes: `curl https://your-domain.railway.app/health`

### **Backend 2: AI Backend (Python) 🔄**

- [ ] Deployed to Railway
- [ ] Environment variable `MODE=PRODUCTION` set
- [x] CORS allows Vercel domain
- [ ] Public domain generated: `________________`
- [ ] Health check passes: `curl https://your-domain.railway.app/health`

### **Frontend: Vercel 🔄**

- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_WS_URL`
  - [ ] `NEXT_PUBLIC_IMAGE_VIDEO_BACKEND_URL`
- [ ] Redeployed after adding variables
- [ ] Can access: `https://vitality-sliding-window.vercel.app`

---

## **📋 PART 6: Quick Reference**

### **Your Deployment URLs**

Fill these in as you deploy:

```bash
# Java Backend
JAVA_BACKEND_URL="https://_____________________.up.railway.app"

# AI Backend
AI_BACKEND_URL="https://_____________________.up.railway.app"

# Frontend
FRONTEND_URL="https://vitality-sliding-window.vercel.app"

# Supabase
SUPABASE_URL="https://_____________________.supabase.co"
```

### **Quick Test Commands**

```bash
# Test Java Backend
curl $JAVA_BACKEND_URL/health

# Test AI Backend  
curl $AI_BACKEND_URL/health

# Test Supabase (from frontend)
# Open browser console on Vercel app:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## **📋 PART 7: Next Steps After Deployment**

1. **Monitor Logs:**
   ```bash
   # Java Backend
   railway logs --service vitality-backend
   
   # AI Backend
   railway logs --service vitality-ai-backend
   ```

2. **Set Up Custom Domains (Optional):**
   - Railway: Settings → Domains → Add custom domain
   - Vercel: Settings → Domains → Add domain

3. **Enable Production Security:**
   - Update CORS to allow only your Vercel domain
   - Enable rate limiting
   - Add authentication headers

4. **Set Up Monitoring:**
   - Railway has built-in metrics
   - Vercel has analytics in dashboard
   - Consider adding Sentry for error tracking

---

## **🆘 Need Help?**

### **Railway Issues:**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

### **Vercel Issues:**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Vercel Status: https://www.vercel-status.com

### **Supabase Issues:**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Supabase Status: https://status.supabase.com

---

## **✅ Success Criteria**

You'll know everything is working when:

1. ✅ Java Backend returns `200 OK` on `/health`
2. ✅ AI Backend returns `{"status":"healthy"}` on `/health`
3. ✅ Vercel frontend loads without errors
4. ✅ Browser console shows no CORS errors
5. ✅ Can create patients in frontend (tests Supabase + Java backend)
6. ✅ Can upload injury images (tests AI backend)
7. ✅ Real-time updates work (tests WebSocket)

---

**Good luck with your deployment! 🚀**
