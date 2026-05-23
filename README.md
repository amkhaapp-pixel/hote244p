# Hotel Booking System

A full-stack hotel booking and management system with React frontend and Express/PostgreSQL backend.

## Features

### Customer Portal
- Room browsing with search and filtering
- Room details with image galleries
- Booking system with date selection
- Payment processing (QR, WeChat, Alipay)
- Booking history
- User profile management
- Multi-language support
- Multi-currency support

### Admin Dashboard
- Dashboard with statistics and analytics
- Room management (CRUD operations)
- Booking management and status updates
- Customer management
- Payment tracking and status updates
- Settings management
- Message management
- Image upload via Cloudinary

## Tech Stack

### Frontend
- React 19.2.5
- Vite 8.0.10
- React Router DOM 7.14.2
- TailwindCSS 4.2.4
- Axios 1.15.2
- React Hot Toast 2.6.0
- Lucide React 1.14.0
- React Datepicker 9.1.0
- date-fns 4.1.0

### Backend
- Node.js + Express 5.2.1
- PostgreSQL
- JWT Authentication
- Bcryptjs for password hashing
- Cloudinary for image storage
- Multer for file uploads

## Project Structure

```
hotel/
├── src/                    # Frontend React application
│   ├── admin/             # Admin dashboard components
│   ├── components/        # Reusable components
│   ├── context/           # React context providers
│   ├── i18n/             # Internationalization
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   └── api/              # API client configuration
├── server/               # Backend Express application
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Backend utilities
│   ├── schema.sql        # Database schema
│   ├── migrate.js        # Database migration script
│   └── .env              # Environment variables
└── public/              # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone <repository-url>
cd hotel
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Setup backend
```bash
cd server
npm install
```

### 4. Configure environment variables
Create a `.env` file in the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/hotel
NODE_ENV=development
JWT_SECRET=your-secret-key-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 5. Setup database
```bash
# Option 1: Create fresh database using schema
psql -U postgres -d hotel -f server/schema.sql

# Option 2: Run migration script (for existing databases)
cd server
node migrate.js
```

### 6. Start the development servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd hotel
npm run dev
```

The frontend will be available at `http://localhost:5170`
The backend API will be available at `http://localhost:5000/api`

## Default Admin Account

After setting up the database, you can create an admin account by registering a user and manually updating their role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use the registration endpoint and then update via database.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID

### Bookings
- `POST /api/booking` - Create booking
- `GET /api/booking/:id` - Get booking by ID
- `GET /api/booking/my-bookings?email=user@example.com` - Get user bookings
- `POST /api/booking/payment` - Process payment

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics (protected)
- `GET /api/admin/bookings` - Get all bookings (protected)
- `PATCH /api/admin/bookings/:id/status` - Update booking status (protected)
- `GET /api/admin/customers` - Get all customers (protected)
- `PUT /api/admin/customers/:id` - Update customer (protected)
- `DELETE /api/admin/customers/:id` - Delete customer (protected)
- `GET /api/admin/payments` - Get all payments (protected)
- `PATCH /api/admin/payments/:id/status` - Update payment status (protected)
- `GET /api/admin/rooms` - Get all rooms (protected)
- `POST /api/admin/rooms` - Create room (protected)
- `PUT /api/admin/rooms/:id` - Update room (protected)
- `DELETE /api/admin/rooms/:id` - Delete room (protected)
- `POST /api/admin/upload-images` - Upload images (protected)
- `GET /api/admin/settings` - Get settings (protected)
- `PUT /api/admin/settings/:key` - Update setting (protected)
- `GET /api/admin/messages` - Get messages (protected)
- `PATCH /api/admin/messages/:id/status` - Update message status (protected)
- `DELETE /api/admin/messages/:id` - Delete message (protected)
- `POST /api/admin/contact` - Submit contact message (public)

## Database Schema

### Tables
- `users` - User accounts
- `rooms` - Room inventory
- `bookings` - Booking records
- `payments` - Payment transactions
- `settings` - System settings
- `messages` - Contact messages

See `server/schema.sql` for detailed schema definition.

## Development

### Build for production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Preview production build
```bash
npm run preview
```

## Design System

The admin dashboard follows a professional design system with:
- **Colors**: Dark primary (#091426), secondary green (#006e2f)
- **Typography**: Inter font family
- **Layout**: 280px sidebar, 4px grid system
- **Principles**: Clarity, efficiency, semantic hierarchy

See `DESIGN.md` for complete design tokens.

## License

ISC
