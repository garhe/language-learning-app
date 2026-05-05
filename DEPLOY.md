# Deploy to Azure App Service (Cloud)

This guide deploys your language learning app to Azure for free/low cost.

## Prerequisites

- Azure account (create free at https://azure.microsoft.com/free)
- Your .env values filled in locally (see README.md)
- Git (optional but recommended)

## Step-by-Step Deployment

### Step 1: Prepare your code

1. Open terminal in [language-learning-app](.)
2. Verify `.env` file exists and is filled with your values
3. Make sure `.gitignore` exists (it should)

### Step 2: Create Azure App Service (via Portal)

1. Go to https://portal.azure.com
2. Log in with your Azure account
3. Click "+ Create a resource"
4. Search for "App Service"
5. Click Create
6. Fill form:
   - **Subscription:** (default)
   - **Resource Group:** click "Create new", name it "language-learning-rg"
   - **Name:** linguastage-app (or any unique name)
   - **Runtime stack:** Node 20 LTS
   - **Operating System:** Linux
   - **Region:** (East US or your preferred region)
   - **App Service Plan:** Create new, name "linguastage-plan", Size: Free tier (F1)
7. Click Review + create
8. Click Create
9. Wait 2-3 minutes for deployment to finish

### Step 3: Configure environment variables

1. After deployment, click "Go to resource"
2. Left menu -> Settings -> Configuration
3. Click "+ New application setting" for each of these:
   - Name: AZURE_FOUNDRY_TARGET_URI, Value: (your Target URI)
   - Name: AZURE_FOUNDRY_KEY, Value: (your Foundry key)
   - Name: AZURE_FOUNDRY_MODEL, Value: gpt-5.4-mini
   - Name: AZURE_SPEECH_KEY, Value: (your Speech key)
   - Name: AZURE_SPEECH_REGION, Value: eastus
   - Name: NODE_ENV, Value: production
4. Click Save
5. Click Continue (if prompted)

### Step 4: Deploy your code (Option A: Git + GitHub)

**Easiest for future updates:**

1. Create GitHub account (free at github.com)
2. Create new repo named "language-learning-app"
3. Copy the clone command
4. Open terminal, go to your project folder
5. Run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/language-learning-app.git
   git push -u origin main
   ```
6. In Azure Portal, go to Deployment Center
7. Choose GitHub as source
8. Authorize and select your repo
9. Click Save
10. Wait 5 minutes for first deploy

### Step 5: Deploy your code (Option B: ZIP upload)

**Quick one-time deploy:**

1. In VS Code Explorer, right-click [language-learning-app](.) -> Open in Integrated Terminal
2. Run:
   ```
   npm install --production
   ```
3. Select all files in the folder (Ctrl+A in Explorer)
4. Right-click -> Compress to ZIP
5. In Azure Portal, go to Deployment Center
6. Choose "Zip Deploy"
7. Upload the ZIP
8. Wait 2-3 minutes

### Step 6: Test your app

1. In Azure Portal resource page, copy the URL from the Overview section
2. Open in browser: https://YOUR-APP-NAME.azurewebsites.net
3. Choose language, level, mode
4. Test pronunciation or conversation
5. All features should work

## Troubleshooting

**App shows error after deploy:**
- Check Application Insights logs in Portal
- Make sure all env vars are filled in Configuration
- Restart app: Overview -> Restart

**Speech API fails:**
- Verify AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are correct
- Check Speech resource still exists in Azure Portal

**LLM fails:**
- Verify all AZURE_FOUNDRY_* values are correct
- Test your Foundry endpoint in Postman if you know how

## Costs

- **Free tier:** App Service F1 is free (1 GB RAM, limited CPU)
- **Speech:** First 5 hours/month free, then ~$1/hour
- **Foundry:** Varies by model usage

For learning, you should stay well within free tier.

## Updates

To update your app:
- If using GitHub: make changes locally, git push, App Service redeploys automatically
- If using ZIP: repeat Step 5 Option B

## Next Steps

- Monitor usage in Azure Portal -> Application Insights
- Scale up plan if you hit limits
- Add authentication if sharing with others
