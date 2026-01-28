# Deploying to Render.com

## Prerequisites
1. GitHub account with your `makeMny` repository
2. MongoDB Atlas account (already set up)
3. Render.com account

## Step-by-Step Deployment

### Step 1: Prepare MongoDB Atlas for Render
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access** → **Add IP Address**
3. Click **Allow Access from Anywhere** (add `0.0.0.0/0`)
   - This allows Render servers to connect
   - For production, you can restrict to Render's IP ranges later

### Step 2: Push Code to GitHub
```bash
git add .
git commit -m "Add Render.com deployment configuration"
git push origin master
```

### Step 3: Create Render Web Service
1. Go to [Render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository (`buttuura/makeMny`)
4. Fill in the details:
   - **Name**: `makemny-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free (or paid for production)

### Step 4: Add Environment Variables
In the Render dashboard, go to **Environment** and add:

```
MONGO_URL=mongodb+srv://delmedah_db_user:Buttuura123@cluster0.od3sa0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

DB_NAME=makemny
```

### Step 5: Deploy
Click **Create Web Service** and Render will automatically deploy your app.

### Step 6: Access Your App
Once deployed, your app will be available at:
```
https://makemny-app.onrender.com
```

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Ensure all dependencies are in `package.json`

### Cannot Connect to MongoDB
- Verify `MONGO_URL` is correct in Render environment
- Check MongoDB Atlas **Network Access** allows `0.0.0.0/0`
- Ensure MongoDB credentials are correct

### App Crashes After Deploy
- Check **Logs** in Render dashboard
- Common issue: Missing environment variables
- Verify `PORT` is not hardcoded (use `process.env.PORT || 5000`)

## Production Tips
1. **Use Render PostgreSQL** instead of MongoDB Atlas for better performance (optional)
2. **Add authentication** for admin endpoints
3. **Use HTTPS only** (Render provides free SSL)
4. **Monitor logs** regularly for errors
5. **Set up auto-deploy** on GitHub push (Render does this by default)

## Your App is Now Live! 🚀
Share your Render URL: `https://makemny-app.onrender.com`
