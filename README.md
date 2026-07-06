# Organization Contribution Manager

A web application for managing organization members and their yearly contributions.

## Features

- **Dual Authentication System**: Separate admin and user login
- **Admin Dashboard**: Full control over members and contributions
- **User Self-Registration**: Members can register themselves
- **Contribution Tracking**: Track yearly contributions for 300+ members
- **Role-Based Access Control**: Different privileges for admins and users

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Password Security**: bcryptjs

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)

## Installation

1. Install Node.js from https://nodejs.org/

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values:
     ```
     MONGODB_URI=your-mongodb-connection-string
     NEXTAUTH_SECRET=generate-using-openssl-rand-base64-32
     NEXTAUTH_URL=http://localhost:3000
     ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## First-Time Setup

1. The application will automatically create an admin account on first run using the credentials in `.env.local`
2. Login as admin using the credentials you set
3. Change the admin password from the settings

## Usage

### Admin Features
- View all members
- Add/edit/delete members
- View all contributions
- Record contributions
- Generate reports
- Manage user accounts

### User Features
- Register account
- View personal profile
- View contribution history
- Update personal information

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── dashboard/         # User dashboard
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and configurations
│   └── models/                # MongoDB models
├── public/                    # Static files
└── package.json
```

## License

MIT
