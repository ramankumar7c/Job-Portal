# Job Portal - Full-Stack Job Board Application

A comprehensive job portal application built with Next.js 15 (App Router), featuring role-based access control for job seekers and employers, complete with job posting, application management, and user profile systems.

## 🚀 Features

### 🔐 Authentication & User Management
- **NextAuth.js Integration**: Secure authentication with JWT strategy
- **Role-Based Access Control**: Separate interfaces for Job Seekers, Employers, and Admins
- **User Registration & Login**: Complete signup/signin flow with validation
- **Profile Management**: Comprehensive user and company profile management

### 💼 Job Seeker Features
- **Browse Jobs**: Advanced job search with filters (location, type, level, keywords)
- **Job Applications**: Apply to jobs with application tracking
- **Application Dashboard**: Monitor application status and history
- **Profile Management**: Skills, experience, and personal information
- **Job Saving**: Save interesting jobs for later review

### 🏢 Employer Features
- **Job Posting**: Create detailed job listings with requirements and benefits
- **Job Management**: Edit, activate/deactivate, and manage job postings
- **Application Review**: View and manage job applications
- **Company Profile**: Manage company information and branding
- **Analytics Dashboard**: Track job performance and application metrics

### 🎨 User Interface
- **Modern Design**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Layout**: Mobile-first design that works on all devices
- **Theme Ready**: Architecture ready for dark/light theming; currently using a clean light theme
- **Interactive Components**: Toast notifications, modals, and form validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: App Router with React 18
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **React Hook Form**: Form handling with Zod validation
- **Lucide React**: Beautiful icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database queries
- **MongoDB**: NoSQL database
- **NextAuth.js**: Authentication framework
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Prisma Client**: Automatically generated on install via `postinstall: prisma generate`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── jobs/          # Job management endpoints
│   │   ├── applications/  # Application endpoints
│   │   ├── profile/       # Profile management endpoints
│   │   └── settings/      # Settings endpoints
│   ├── dashboard/         # User dashboard
│   ├── jobs/              # Job-related pages
│   │   ├── [id]/          # Individual job details
│   │   └── new/           # Job posting form
│   ├── applications/      # Application management
│   ├── profile/           # Profile settings
│   ├── settings/          # Account settings
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── jobs/              # Job-specific components
├── lib/                    # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # Helper functions
│   └── validations/       # Zod validation schemas
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── prisma/                 # Database schema and migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramankumar7c/Job-Portal.git
   cd Job-Portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="mongodb://localhost:27017/job-portal"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile information
- **JobListing**: Job postings with requirements and benefits
- **JobApplication**: Job applications with status tracking
- **Experience**: Work experience for job seekers
- **Notification**: User notifications system

### Key Relationships
- Users can have multiple job listings (employers)
- Users can have multiple job applications (job seekers)
- Job listings can have multiple applications
- Users can have multiple work experiences

## 🔐 Authentication Flow

1. **User Registration**: Choose role (Job Seeker/Employer)
2. **Email Verification**: Secure account creation
3. **Login**: JWT-based authentication
4. **Role-Based Access**: Different interfaces based on user role
5. **Session Management**: Secure session handling with NextAuth

## 🎯 Key Features Implementation

### Job Search & Filtering
- Full-text search across job titles, descriptions, and companies
- Advanced filtering by location, job type, experience level
- Pagination for large result sets
- Real-time search updates

### Application Management
- Complete application lifecycle tracking
- Status updates (Applied, Reviewed, Shortlisted, Interviewed, Rejected, Accepted)
- Application history and analytics
- Cover letter support

### Profile Management
- Comprehensive user profiles
- Skills and experience management
- Company information for employers
- Profile visibility controls

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. On first deploy or after Prisma schema changes, run:
   ```bash
   npx prisma db push
   ```

### Other Platforms
- **Railway / Render / DigitalOcean App Platform**: ensure `postinstall` runs `prisma generate`. Run `npx prisma db push` once per new DB or schema update.

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="mongodb://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Customization
- **Branding**: Update colors in `tailwind.config.ts`
- **Components**: Modify shadcn/ui components in `components/ui/`
- **Validation**: Update Zod schemas in `lib/validations/`
- **Database**: Modify Prisma schema in `prisma/schema.prisma`

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session

### Job Endpoints
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create new job
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Application Endpoints
- `GET /api/applications` - Get user applications
- `POST /api/jobs/[id]/apply` - Apply to job
- `GET /api/applications/stats` - Application statistics

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/experiences` - Get work experiences
- `POST /api/profile/experiences` - Add experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Next.js** team for the amazing framework
- **Prisma** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you have any questions or need help:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
