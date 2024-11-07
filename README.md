# Modern Billing System

A comprehensive billing and invoice management system built with Next.js 13, Prisma, and shadcn/ui.

## Features

- 🔐 Role-based Authentication (Admin, Accountant, Customer)
- 💰 Invoice Management
- 📊 Payment Tracking
- 📈 Analytics Dashboard
- 👥 User Management
- 🌓 Dark Mode Support
- 📱 Responsive Designs

## Tech Stack

- [Next.js 13](https://nextjs.org/) - React Framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Recharts](https://recharts.org/) - Charts
- [Lucide Icons](https://lucide.dev/) - Icons

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- Yarn package manager
- SQLite (default) or any other database supported by Prisma

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/modern-billing-system.git
   cd modern-billing-system
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration.

4. Initialize the database:

   ```bash
   yarn prisma migrate dev
   ```

5. Start the development server:
   ```bash
   yarn dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                  # Next.js 13 app directory
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   └── dashboard/       # Dashboard pages
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── invoices/       # Invoice-related components
│   ├── layout/         # Layout components
│   └── ui/             # UI components (shadcn/ui)
├── lib/                # Utility functions
├── prisma/             # Database schema and migrations
└── public/            # Static files
```

## API Routes

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up

### Invoices

- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PATCH /api/invoices/[id]/status` - Update invoice status

### Users

- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)

### Admin

- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/revenue` - Get revenue data
- `GET /api/admin/activity` - Get user activity data
- `GET /api/admin/payments` - Get recent payments

## Role-Based Access

The system supports three user roles:

1. **Admin**

   - Full system access
   - User management
   - Analytics dashboard
   - Invoice management

2. **Accountant**

   - Invoice management
   - Payment tracking
   - Reports access

3. **Customer**
   - View own invoices
   - Make payments
   - Update profile

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Prisma](https://www.prisma.io/) for the powerful ORM
- [Vercel](https://vercel.com/) for the hosting platform
