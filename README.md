# AI Art Generator - Installation & Setup Guide

This guide will help you install and run the AI Art Generator application, which allows users to create AI-generated artwork using DALL-E and Claude AI models.

## Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

## Required API Keys & Services

You'll need accounts and API keys for:

1. **Firebase** (for database and storage)
2. **OpenAI** (for DALL-E image generation)
3. **Anthropic** (for Claude AI prompt enhancement)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ai-art-generator
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Firebase

### 3.1 Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 3.2 Enable Required Services
In your Firebase project:

1. **Firestore Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development

2. **Storage**:
   - Go to "Storage"
   - Click "Get started"
   - Use default security rules for development

3. **Web App Configuration**:
   - Go to Project Settings → General
   - Add a web app
   - Copy the Firebase configuration object

### 3.3 Set Up Firestore Collections
Create these collections in Firestore:

1. **loginIDs** - For user authentication
   - Document format: `CAC25-001`, `CAI25-001`, etc.
   - Fields: `isActive: true`, `createdAt: timestamp`, `type: string`

2. **prompts** - For storing generated images
3. **conversationContext** - For AI conversation history
4. **userStats** - For tracking user statistics

## Step 4: Get API Keys

### 4.1 OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 4.2 Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up/Login
3. Go to API Keys
4. Create a new API key
5. Copy the key

## Step 5: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Keys
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_CLAUDE_API_KEY=your_anthropic_api_key

# Optional: Backend API URL (if using custom backend)
REACT_APP_API_URL=http://localhost:3001
```

## Step 6: Set Up Login IDs

### 6.1 Create Initial Login IDs
Add documents to the `loginIDs` collection in Firestore:

**For AI-involved category (can upload images):**
```javascript
// Document ID: CAC25-001
{
  isActive: true,
  createdAt: Firebase.Timestamp.now(),
  type: "AI-involved"
}
```

**For AI-only category (text prompts only):**
```javascript
// Document ID: CAI25-001
{
  isActive: true,
  createdAt: Firebase.Timestamp.now(),
  type: "AI-only"
}
```

### 6.2 Using the Admin Page
Alternatively, you can use the built-in admin page:
1. Navigate to `/admin` in your application
2. Create login IDs using the interface

## Step 7: Run the Application

### Development Mode
```bash
npm start
```

The application will open at `http://localhost:3000`

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

## Step 8: Test the Setup

1. **Access the Application**: Go to `http://localhost:3000`
2. **Login**: Use a login ID you created (e.g., `CAC25-001`)
3. **Generate an Image**: Enter a text prompt and click generate
4. **Upload Test** (for CAC25 users): Try uploading an image with a prompt

## Folder Structure

```
src/
├── components/          # React components
│   ├── LoginPage.js    # User authentication
│   ├── MainPage.js     # Main application interface
│   ├── AdminPage.js    # Admin panel for creating login IDs
│   └── ...
├── context/            # React context for state management
├── services/           # API and Firebase services
│   ├── firebase.js     # Firebase configuration and functions
│   └── api.js          # AI API integrations
└── ...
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Firebase permission errors**:
   - Check Firestore security rules
   - Ensure Firebase configuration is correct

3. **API key errors**:
   - Verify all API keys are correctly set in `.env`
   - Check API key permissions and billing

4. **Image upload failures**:
   - Ensure Firebase Storage is properly configured
   - Check file size limits (default: 10MB)

### Environment Variables Check

Add this temporary component to verify environment variables are loaded:

```javascript
// Temporary debug component
const EnvCheck = () => (
  <div>
    <p>Firebase Project ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✓' : '✗'}</p>
    <p>OpenAI Key: {process.env.REACT_APP_OPENAI_API_KEY ? '✓' : '✗'}</p>
    <p>Claude Key: {process.env.REACT_APP_CLAUDE_API_KEY ? '✓' : '✗'}</p>
  </div>
);
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Keys**: Never commit API keys to version control
2. **Firebase Rules**: Update Firestore security rules for production
3. **CORS**: Configure proper CORS settings for production deployment
4. **Environment**: Use separate Firebase projects for development and production

## Production Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Other Platforms
- **Netlify**: Connect your repository and set environment variables
- **Vercel**: Import project and configure environment variables
- **AWS S3 + CloudFront**: Upload build files to S3 bucket

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure all Firebase services are properly configured
4. Check API key permissions and billing status

## Features Overview

- **User Authentication**: Login ID based system
- **AI Image Generation**: DALL-E 3 integration
- **Prompt Enhancement**: Claude AI for better prompts
- **Image Upload**: Upload reference images (CAC25 users only)
- **Conversation Context**: AI remembers previous generations
- **Admin Panel**: Create and manage login IDs
- **Statistics Tracking**: User session and time tracking

The application is now ready to use! Users can log in with their assigned login IDs and start generating AI artwork.
