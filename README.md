# Lead Source Mapping Tool

An interactive tool for managing Salesforce Lead Source → Lead Source Detail mappings.

## Features
- Drag and drop detail values between lead source cards
- Add new detail values with the + button on each card
- Remove detail values with the × button
- Changes auto-save to browser localStorage
- Export final mapping to CSV for Salesforce setup
- Retired values section for picklist values to deactivate

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Create a new repo on GitHub (e.g. `lead-source-map`)
2. In your terminal:
```bash
cd lead-source-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lead-source-map.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `lead-source-map` repo
4. Vercel will auto-detect Create React App — just click **Deploy**
5. Your app will be live at `https://lead-source-map.vercel.app` (or similar)

### Step 3 — Share
Send the Vercel URL to your VP of Marketing and Head of Demand Gen.

## Local Development
```bash
npm install
npm start
```

## Notes
- Data saves to `localStorage` in each user's browser
- Use **Export CSV** to get a clean two-column file (Lead Source, Lead Source Detail) ready for Salesforce dependent picklist setup
- Use **Reset** to restore default values if needed
