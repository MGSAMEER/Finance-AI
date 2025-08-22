# Finance AI - Smart Financial Dashboard

A modern, AI-powered financial dashboard built with Next.js 15, TypeScript, and Tailwind CSS. Features expense tracking, income management, interactive charts, and an intelligent AI advisor.

## 🚀 Features

- **📊 Smart Dashboard** - Real-time financial insights with interactive charts
- **🤖 AI Financial Advisor** - Get personalized financial advice and insights
- **💰 Expense & Income Tracking** - Easy transaction management
- **📈 Visual Analytics** - Pie charts, bar charts, and trend analysis
- **🌍 Multi-language Support** - English, Hindi, and Marathi
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **💾 Local Storage** - All data stored securely in your browser
- **📥 CSV Import** - Import transactions from external sources
- **🎯 Gamification** - Achievements and progress tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Dexie (IndexedDB)
- **Charts**: Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Internationalization**: i18next
- **AI**: Custom frontend-only advisor

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **Package Manager**: npm, yarn, pnpm, or bun
- **Browser**: Modern browser with IndexedDB support

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd finance-ai
npm install
```

### 2. Environment Setup

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_APP_NAME=Finance AI
NEXT_PUBLIC_DB_RESET_ON_SCHEMA_CHANGE=true
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Initial Setup

1. Navigate to **Settings** → **Database Management**
2. Click **"Reset Database & Seed Demo"** to populate with sample data
3. Explore the dashboard, charts, and AI advisor

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🚨 Troubleshooting

### Quick Fixes for Common Issues

#### **1. Database Issues (IndexedDB)**

**Problem**: Charts not loading, data missing, or migration errors

**Solutions**:
- **Via App**: Go to **Settings** → **Database Management** → Click **"Reset Database & Seed Demo"**
- **Via Browser DevTools**:
  ```javascript
  // Chrome/Edge DevTools Console
  indexedDB.deleteDatabase('FinanceAIDB');
  location.reload();
  ```
- **Firefox DevTools**:
  ```javascript
  // Firefox DevTools Console
  indexedDB.deleteDatabase('FinanceAIDB');
  location.reload();
  ```

#### **2. Build/Dependency Issues**

**Problem**: `npm run dev` fails, missing modules, or build errors

**Solutions**:
```bash
# Windows (PowerShell/CMD)
Remove-Item -Recurse -Force node_modules, .next
npm install

# macOS/Linux
rm -rf node_modules .next
npm install

# Alternative: Use different package manager
pnpm install
# or
yarn install
```

#### **3. Node.js Version Issues**

**Problem**: Version mismatch or compatibility errors

**Solutions**:
```bash
# Check current version
node --version

# Install/switch to correct version
# Using nvm (recommended)
nvm install 18
nvm use 18

# Using n (alternative)
n 18

# Windows: Download from nodejs.org
# https://nodejs.org/en/download/
```

#### **4. Port Already in Use**

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Use different port
npm run dev -- -p 3001
# or
PORT=3001 npm run dev

# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### **5. TypeScript/ESLint Errors**

**Problem**: Type errors or linting failures

**Solutions**:
```bash
# Fix TypeScript errors
npm run build

# Fix ESLint errors
npm run lint -- --fix

# Check for type issues only
npx tsc --noEmit
```

#### **6. Browser Compatibility Issues**

**Problem**: App doesn't work in certain browsers

**Solutions**:
- **Use Chrome/Edge/Firefox** (recommended)
- **Enable IndexedDB** in browser settings
- **Clear browser cache** and reload
- **Disable browser extensions** temporarily

#### **7. Import/Export Issues**

**Problem**: CSV import fails or data not loading

**Solutions**:
- **Check CSV format**: Use the template from Import dialog
- **Validate data**: Ensure amounts are numbers, dates are YYYY-MM-DD
- **Browser permissions**: Allow file access when prompted
- **File encoding**: Use UTF-8 encoding for CSV files

#### **8. Performance Issues**

**Problem**: Slow loading or laggy interface

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next/cache

# Rebuild dependencies
npm run build

# Check for memory leaks in DevTools
# Monitor IndexedDB size in Application tab
```

#### **9. Environment Variables**

**Problem**: App name not showing or features not working

**Solutions**:
```bash
# Ensure .env.local exists
echo "NEXT_PUBLIC_APP_NAME=Finance AI" > .env.local
echo "NEXT_PUBLIC_DB_RESET_ON_SCHEMA_CHANGE=true" >> .env.local

# Restart dev server after changes
npm run dev
```

#### **10. Cross-Platform Issues**

**Windows-specific**:
```powershell
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Use Windows Terminal for better experience
```

**macOS-specific**:
```bash
# Install dependencies with Homebrew
brew install node

# Use zsh instead of bash
chsh -s /bin/zsh
```

**Linux-specific**:
```bash
# Install Node.js via package manager
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fix permissions
sudo chown -R $USER:$USER ~/.npm
```

### 🔍 Debug Mode

Enable debug mode for detailed logging:

```env
# Add to .env.local
NEXT_PUBLIC_DEBUG_MODE=true
```

### 📞 Getting Help

If issues persist:
1. Check browser console for errors
2. Verify Node.js version matches requirements
3. Try clearing all caches and reinstalling
4. Check [Next.js documentation](https://nextjs.org/docs)
5. Review [Dexie documentation](https://dexie.org/docs/)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Dexie Documentation](https://dexie.org/docs/) - IndexedDB wrapper
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Chart library documentation

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Configure Environment Variables**:
   ```env
   NEXT_PUBLIC_APP_NAME=Finance AI
   NEXT_PUBLIC_DB_RESET_ON_SCHEMA_CHANGE=false
   NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   ```
4. **Deploy**: Vercel will automatically build and deploy your app

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to any platform supporting Node.js
```

### Environment Variables for Production

```env
# Required
NEXT_PUBLIC_APP_NAME=Finance AI

# Optional
NEXT_PUBLIC_DB_RESET_ON_SCHEMA_CHANGE=false
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Database layer using [Dexie](https://dexie.org/)
