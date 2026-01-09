<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Q9iCq2DeRuaMVtyrgISENRxr1S39zTMb

## Run Locally

**Prerequisites:**  Node.js



1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (create the file if it doesn't exist)
3. Run the app:
   `npm run dev`

## Deployment

This project is configured to deploy to GitHub Pages automatically via GitHub Actions.

1. Push your changes to the `main` branch.
2. The "Deploy to GitHub Pages" action will trigger automatically.
3. Once completed, your app will be live at `https://<username>.github.io/<repo-name>/`.

Ensure execution permissions are enabled for GitHub Actions in your repository settings under **Settings > Actions > General**.
