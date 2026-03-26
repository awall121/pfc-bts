# PFC BTS — Back Tee Swat
## Deployment Guide

### What You're Setting Up
- A web app your whole SWAT group can access from their phones
- Real-time shared data (everyone sees the same schedule, scores, leaderboard)
- Works like a native app when added to home screen (PWA)
- Free hosting, free database

### Total Time: ~30-45 minutes
### Total Cost: $0 (optional: $12/year for custom domain)

---

## STEP 1: Create a GitHub Account (5 min)

1. Go to **https://github.com** and click "Sign Up"
2. Use your email, create a username and password
3. Verify your email

## STEP 2: Create a GitHub Repository (3 min)

1. Click the green **"New"** button (top left) or go to **https://github.com/new**
2. Name it: `pfc-bts`
3. Set it to **Public**
4. Check **"Add a README file"**
5. Click **"Create repository"**

## STEP 3: Upload the Project Files (5 min)

1. In your new repository, click **"Add file" > "Upload files"**
2. Drag the entire `pfc-bts-project` folder contents into the upload area:
   - `package.json`
   - `vite.config.js`
   - `index.html`
   - `public/` folder (with manifest.json)
   - `src/` folder (with main.jsx, App.jsx, firebase.js)
3. Click **"Commit changes"**

Your file structure should look like:
```
pfc-bts/
  package.json
  vite.config.js
  index.html
  public/
    manifest.json
  src/
    main.jsx
    App.jsx
    firebase.js
```

## STEP 4: Set Up Firebase (10 min)

This gives you the shared database so everyone sees the same data.

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"** (or "Add project")
3. Name it: `pfc-bts`
4. Turn OFF Google Analytics (you don't need it)
5. Click **"Create project"** and wait

### Add a Web App:
1. On the project overview page, click the **web icon (</>)**
2. Nickname it: `PFC BTS Web`
3. Check **"Also set up Firebase Hosting"** (optional but nice)
4. Click **"Register app"**
5. **IMPORTANT**: You'll see a code block with your Firebase config. It looks like:
   ```
   apiKey: "AIzaSy...",
   authDomain: "pfc-bts-xxxxx.firebaseapp.com",
   projectId: "pfc-bts-xxxxx",
   ...
   ```
6. **Copy these values.** You'll paste them into `src/firebase.js`

### Enable Firestore Database:
1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Pick a location close to you (us-east1 for Pittsburgh)
5. Click **"Enable"**

## STEP 5: Add Your Firebase Config (3 min)

1. Go back to GitHub, navigate to `src/firebase.js`
2. Click the **pencil icon** to edit
3. Replace the placeholder values with YOUR Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "pfc-bts-xxxxx.firebaseapp.com",
     projectId: "pfc-bts-xxxxx",
     storageBucket: "pfc-bts-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
4. Click **"Commit changes"**

## STEP 6: Deploy on Vercel (5 min)

1. Go to **https://vercel.com** and click **"Sign Up"**
2. Sign up with your **GitHub account** (this connects them)
3. Click **"Add New" > "Project"**
4. You'll see your `pfc-bts` repository — click **"Import"**
5. Framework Preset should auto-detect as **"Vite"**
6. Click **"Deploy"**
7. Wait 1-2 minutes... 

**You now have a live URL like `pfc-bts.vercel.app`!**

## STEP 7: Share With the Group (2 min)

Send the URL to everyone. They can:
- Open it in Chrome/Safari on their phone
- Tap **"Add to Home Screen"** (Share button > Add to Home Screen)
- It now appears as an app icon on their phone

---

## HOW TO UPDATE THE APP

When you want to add features or make changes:

1. Come to Claude and say "update my PFC BTS app — I want to add [feature]"
2. I'll give you updated code
3. Go to GitHub, navigate to `src/App.jsx`
4. Click the pencil icon to edit
5. Select all, delete, paste the new code
6. Click "Commit changes"
7. **Vercel automatically redeploys in ~60 seconds**
8. Everyone sees the update next time they open the app

That's it. No terminal, no command line, just copy/paste on GitHub.

---

## OPTIONAL: Custom Domain ($12/year)

Want `pfcbts.com` instead of `pfc-bts.vercel.app`?

1. Buy a domain at **https://namecheap.com** (~$12/year)
2. In Vercel, go to your project **Settings > Domains**
3. Add your domain
4. Follow the DNS instructions (Vercel walks you through it)

---

## SECURING FIREBASE (Do After Testing)

Once everything works, update your Firestore rules:

1. In Firebase Console > Firestore Database > Rules
2. Replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /appData/{doc} {
         allow read, write: if true;
       }
     }
   }
   ```
   (For a small private group, this is fine. If you want authentication later, we can add it.)

---

## TROUBLESHOOTING

**"My changes aren't showing up"**
- Check Vercel dashboard — make sure the deployment succeeded
- Try hard-refreshing the page (Ctrl+Shift+R on desktop, or clear cache on phone)

**"Firebase errors in console"**
- Double-check your config values in firebase.js match exactly what Firebase gave you
- Make sure Firestore is enabled and in test mode

**"The app looks weird on my phone"**
- Make sure you're accessing via the Vercel URL, not opening the HTML file directly

**Need help?**
- Come back to Claude anytime and describe the issue
- Screenshot the error if you can
