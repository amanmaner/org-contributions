# Organization Contribution Manager - Setup Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/ (version 18 or higher recommended)

After installation, verify by opening PowerShell and running:
```powershell
node --version
npm --version
```

### 2. Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

**Option B: MongoDB Local Installation**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on `mongodb://localhost:27017`

## Project Setup

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages (~2-3 minutes).

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env.local
```

2. Open `.env.local` in a text editor and update the values:

```env
# Your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/organization-contributions
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organization-contributions

# Generate a secret key (run this in PowerShell):
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-generated-secret-here

# Application URL
NEXTAUTH_URL=http://localhost:3000

# Admin credentials for first-time setup
ADMIN_EMAIL=admin@organization.com
ADMIN_PASSWORD=ChangeThisPassword123
```

### Step 3: Generate NextAuth Secret

Run this command in PowerShell to generate a secure secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value in `.env.local`.

### Step 4: Start the Development Server

```powershell
npm run dev
```

The application will start on http://localhost:3000

### Step 5: Initialize Admin Account

1. Open your browser and go to http://localhost:3000/api/users (POST request)
   
   **OR** use this PowerShell command:
   
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST
   ```

2. This creates the admin account using credentials from `.env.local`

### Step 6: Login

1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Login with your admin credentials:
   - Email: `admin@organization.com` (or what you set in .env.local)
   - Password: `ChangeThisPassword123` (or what you set in .env.local)

## Usage Guide

### For Admin Users:

1. **Dashboard** (`/admin`)
   - View organization statistics
   - Quick access to members and contributions

2. **Members Management** (`/admin/members`)
   - View all registered members
   - Filter by active/inactive status
   - Activate or deactivate member accounts
   - View member details

3. **Contributions Management** (`/admin/contributions`)
   - View all contributions
   - Record new contributions for members
   - Track payment methods and dates
   - Filter by year or member

### For Regular Users:

1. **Registration**
   - Visit http://localhost:3000/auth/register
   - Fill in your details
   - Receive a unique membership number
   - Login with your credentials

2. **Dashboard** (`/dashboard`)
   - View personal profile
   - See contribution history
   - Track total contributions

## Building for Production

1. Create a production build:
```powershell
npm run build
```

2. Start the production server:
```powershell
npm start
```

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Other Platforms
- Netlify
- AWS
- DigitalOcean
- Railway
- Render

## Troubleshooting

### "Cannot connect to MongoDB"
- Check if MongoDB is running (local installation)
- Verify your MONGODB_URI in .env.local
- Check network/firewall settings for MongoDB Atlas

### "NextAuth Secret Error"
- Make sure NEXTAUTH_SECRET is set in .env.local
- Generate a new secret using the command above

### "Module not found"
- Run `npm install` again
- Delete `node_modules` folder and `.next` folder, then run `npm install`

### Port 3000 already in use
- Stop other applications using port 3000
- Or change the port: `npm run dev -- -p 3001`

## Security Recommendations

1. **Change Default Admin Password**
   - After first login, create a new admin user with a strong password
   - Delete or change the default admin account

2. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, and symbols

3. **Keep Dependencies Updated**
   ```powershell
   npm update
   ```

4. **Enable HTTPS in Production**
   - Use SSL certificates
   - Most hosting platforms provide this automatically

5. **Backup Your Database**
   - Regular MongoDB backups
   - Export important data periodically

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in the browser console
3. Check the terminal/PowerShell for server errors

## Project Structure

```
organization-contribution-manager/
├── src/
│   ├── app/                    # Next.js pages and routes
│   │   ├── api/               # Backend API endpoints
│   │   │   ├── auth/         # Authentication routes
│   │   │   ├── admin/        # Admin API routes
│   │   │   ├── users/        # User management
│   │   │   └── contributions/ # Contribution management
│   │   ├── admin/            # Admin pages
│   │   ├── dashboard/        # User dashboard
│   │   └── auth/             # Login/Register pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities (MongoDB connection)
│   └── models/              # Database models
├── public/                   # Static files
├── .env.local               # Environment variables (create this)
├── .env.example             # Example environment file
├── package.json             # Dependencies
└── README.md                # This file
```

## Features Implemented

✅ Separate admin and user authentication  
✅ User self-registration  
✅ Admin dashboard with statistics  
✅ Member management (activate/deactivate)  
✅ Contribution tracking (yearly)  
✅ Multiple payment methods  
✅ Automatic membership number generation  
✅ Role-based access control  
✅ Responsive design  
✅ Secure password hashing  
✅ MongoDB database integration  

## Next Steps (Optional Enhancements)

- Email notifications for new registrations
- Export reports to PDF/Excel
- Payment reminders
- Multi-year contribution reports
- User profile editing
- Password reset functionality
- Email verification
- Audit logs
- Advanced search and filtering
