# Team Expense Tracker

A comprehensive team expense management application built with Next.js, MongoDB, and TypeScript.

## Features

- User authentication and authorization (Employee/Admin roles)
- Expense creation and management
- Admin expense approval workflow
- Analytics and reporting
- Real-time expense tracking
- Receipt upload support

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Testing**: Playwright

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd team-expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/expense_tracker

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

4. Start MongoDB:
- For local MongoDB: `mongod`
- For MongoDB Atlas: Ensure your cluster is running and accessible

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Users

The application automatically creates default users on first run:

- **Admin**: `supratim.admin@gmail.com` / `Admin123`
- **Employee**: `Aashish@gmail.com` / `Aashish123`

### MongoDB Collections

1. **users**: User accounts with authentication data
2. **expenses**: Expense records with approval workflow

## Available Scripts

- `npm run dev` - Start development server with turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:headed` - Run Playwright tests in headed mode
- `npm run test:e2e:debug` - Debug Playwright tests

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Expenses
- `GET /api/expenses` - Get expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/[id]/approve` - Approve/reject expense (admin only)

### Analytics
- `GET /api/analytics` - Get expense analytics

## Production Deployment

1. Set up a production MongoDB database (MongoDB Atlas recommended)
2. Update the `MONGODB_URI` environment variable
3. Generate a secure `JWT_SECRET`
4. Build and deploy using your preferred platform (Vercel, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.