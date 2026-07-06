# Quick Reference Guide

## Installation (First Time)

```powershell
# Run the quick setup script
.\setup.ps1
```

OR manually:

```powershell
# 1. Install dependencies
npm install

# 2. Create .env.local from example
Copy-Item .env.example .env.local

# 3. Edit .env.local with your settings

# 4. Start development server
npm run dev

# 5. Initialize admin (in a new terminal)
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST
```

## Daily Usage

```powershell
# Start the development server
npm run dev
```

Then open http://localhost:3000 in your browser.

## Default Credentials

- **Admin Email**: admin@organization.com
- **Admin Password**: ChangeThisPassword123

⚠️ **CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN**

## User Registration

Users can register themselves at: http://localhost:3000/auth/register

## Key URLs

- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Admin Dashboard**: http://localhost:3000/admin
- **User Dashboard**: http://localhost:3000/dashboard

## Troubleshooting

**"Cannot connect to database"**
→ Make sure MongoDB is running on port 27017 or update MONGODB_URI in .env.local

**"Port 3000 in use"**
→ Run on different port: `npm run dev -- -p 3001`

**Need to reset?**
→ Delete `.next` folder and `node_modules`, then run `npm install` again

## Project Commands

```powershell
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run linter
```

## Database

Your database will be created automatically when you first run the application.

**Local MongoDB**: `mongodb://localhost:27017/organization-contributions`

**MongoDB Atlas**: Update MONGODB_URI in .env.local with your cloud connection string

## File Structure

```
src/
├── app/
│   ├── api/           # Backend APIs
│   ├── admin/         # Admin pages
│   ├── dashboard/     # User pages
│   └── auth/          # Login/Register
├── components/        # Reusable components
├── lib/              # Database connection
└── models/           # Data schemas
```

## Features

✅ Admin & User Roles  
✅ Self Registration  
✅ Member Management  
✅ Contribution Tracking  
✅ Payment Methods  
✅ Auto Membership Numbers  

For detailed documentation, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
