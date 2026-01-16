# 🎓 OspreyPlan

OspreyPlan is a degree planning platform built specifically for Stockton students. It helps you plan your degree, track progress, and build your schedule with confidence, ensuring you're on track for graduation.

## ✨ What It Does

OspreyPlan takes the complexity out of course planning by:
- Visualizing your entire degree in a semester-by-semester layout
- Tracking prerequisites automatically with visual indicators showing which courses unlock others
- Verifying your plan against official degree requirements with a built-in Degree Audit
- Preventing scheduling conflicts by validating prerequisite requirements in real-time
- Managing credit hours with warnings when semesters exceed recommended limits
- Syncing your plan across devices with secure cloud storage

Whether you're a freshman mapping out your first year or a senior finalizing your path to graduation, OspreyPlan gives you confidence that every course fits into your academic journey.

## 🚀 Getting Started

1. Visit [ospreyplan.app](https://ospreyplan.app)
2. Click Login and sign in with your `@go.stockton.edu` Google account
3. Go to the Settings page to configure your degree program and expected graduation year
4. Navigate to the Planner page to start building your semester schedule:
   - Click "Add semester" to create a new term (Spring, Summer, Fall, or Winter)
   - Click "+" in any semester to search and add courses
   - View your Degree Audit at the bottom of the page to track real-time progress towards graduation
   - Courses with unmet prerequisites appear with a red indicator (plan accordingly!)

## 🎯 Key Features

### Degree Audit Integration

- **Real-time Progress Tracking**: Automatically checks your planned courses against degree requirements
- **Visual Status**: Clear visual indicators for satisfied requirements (green) and missing credits (red)
- **Categorized Breakdown**: View progress by category (Major Requirements, Cognates, General Studies, etc.)
- **Gap Analysis**: Instantly see exactly what courses or attributes (e.g., "W2", "Q2") are missing from your plan

### Smart Prerequisite Tracking

- Visual pre/postreq chains: Hover over any course to see which courses it requires (amber highlight) and which courses require it (green highlight)
- Missing prereq alerts: Courses with unmet prerequisites are flagged with red indicators and detailed warnings
- Complex logic support: Handles "AND"/"OR" prerequisite requirements (e.g., "MATH 2225 AND (CSIS 2102 OR CSCI 2102)")

### Flexible Planning

- Multi-semester view: Easily view your full academic plan with several semesters displayed at once
- Variable credit support: Select specific credit values for courses with variable ranges
- Custom semester naming: Set any term and year combination you need for complete flexibility
- Credit hour tracking: Automatic totals for each semester with warnings when exceeding 18 credits
- Easy course management: Add, remove, or rearrange courses with simple clicks

### Secure & Personal

- Google OAuth authentication: Sign in securely with your Stockton email
- Private planning: Your degree plan is stored securely and only visible to you
- Auto-save: Changes sync automatically, so there is no risk of losing your work

## 🧩 Tech Stack

### Frontend

- Next.js 15.4.10 with React 19.1.0 - Modern full-stack React framework with App Router
- TypeScript 5.0 - Type-safe development
- Tailwind CSS v4.0 - Utility-first CSS framework
- shadcn/ui - Accessible component library built on Radix UI
- React Server Components - Optimized rendering and reduced client bundle size

### Backend

- Java 21 - Modern, scalable backend language
- Spring Boot 3.5.4 - Production-ready REST API framework
- JPA/Hibernate - Object-relational mapping for database interactions
- Maven - Dependency management and build automation

### Infrastructure & Auth

- Supabase - Managed PostgreSQL database with Row Level Security (RLS)
- Google OAuth 2.0 + PKCE - Secure, passwordless authentication via Stockton Google accounts
- Vercel - Frontend hosting
- Render - Backend hosting

### Architecture Highlights

- Normalized database schema with composite keys for course identification
- Prerequisite parsing engine that handles complex AND/OR logic matrices
- Responsive, mobile-first design using Tailwind breakpoints

## 📂 Project Structure

```
ospreyplan/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components (UI + feature components)
│   │   ├── hooks/         # Custom React hooks (usePlannerApi, etc.)
│   │   ├── lib/           # Utilities (prerequisites, course parsing)
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
│
└── backend/               # Spring Boot API
    └── src/main/java/app/ospreyplan/backend/
        ├── auth/          # Authentication endpoints
        ├── courses/       # Course catalog management
        ├── planner/       # Semester and course planning logic
        ├── security/      # Security filters and configs
        └── usersettings/  # User preferences
```

## 📄 License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

## 📢 Disclaimer

*OspreyPlan is an independent student project and is not officially affiliated with Stockton University.*
