# KMR-EduVision

**Smart Testing & Curriculum Management System for K-12 Schools**

![KMR-EduVision Logo](./public/logo.svg)

## Overview

KMR-EduVision is a comprehensive educational platform designed to automate and streamline testing and curriculum management for K-12 teachers. Upload any ebook, create intelligent tests, download/print assessments, and track student progress—all in one unified system.

## Features

### 📚 Ebook Management
- Upload any ebook (PDF, EPUB)
- Automatic text extraction and indexing
- Organize by grade, subject, topic
- Full-text search across all ebooks

### 📝 Smart Test Creation
- Create tests from uploaded ebook content
- Question bank with auto-categorization
- Multiple question types:
  - Multiple Choice Questions (MCQ)
  - Short Answer
  - Essay
  - True/False
- Set difficulty levels and time limits
- Instant test preview

### 🖨️ Download & Print Options
- **PDF Download**
  - Professional formatting
  - Question + Answer key versions
  - Student version (without answers)
  - Multiple copies in single PDF
  
- **Word Export (.docx)**
  - Fully editable format
  - Maintain formatting
  - Answer keys separate
  
- **Direct Print**
  - One-click printing
  - Booklet format support
  - Custom margins and orientation

### 👥 Student Management
- Assign tests to students
- Track submissions
- Online and offline submission options
- Photo/scan upload for offline tests

### ✅ Grading & Evaluation
- Automatic grading for MCQ and True/False
- Manual grading interface for essays
- Rubric-based assessment
- Instant feedback to students

### 📊 Analytics & Reports
- Student performance dashboard
- Class-wide analytics
- Topic-wise performance breakdown
- Downloadable reports (PDF/Excel)
- Grade distribution charts

### 🎯 Curriculum Management
- Map ebooks to curriculum standards
- Organize topics and sub-topics
- Track learning objectives
- Content linking and organization

## Tech Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Premium UI components
- **React Query** - Data fetching and caching

### Backend
- **Next.js API Routes** - RESTful APIs
- **Node.js** - Runtime environment

### Database
- **PostgreSQL** - Relational database
- **Prisma ORM** - Database client and toolkit

### Ebook Processing
- **pdf-parse** - Extract text from PDFs
- **pdfjs-dist** - Render PDFs in browser
- **epub** - Handle EPUB files

### Document Generation
- **jsPDF** - PDF generation from HTML
- **html2pdf** - Convert HTML to PDF
- **docx** - Generate Word documents
- **react-to-print** - Print functionality

### Authentication
- **NextAuth.js** - Secure authentication
- **bcryptjs** - Password hashing

### Storage
- **AWS S3** or local file storage

### Additional Tools
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation
- **Zod** - Schema validation

## Project Structure

```
kmr-eduvision/
├── app/                              # Next.js app directory
│   ├── api/                         # API routes
│   │   ├── auth/                    # Authentication endpoints
│   │   ├── ebooks/                  # Ebook management
│   │   ├── tests/                   # Test management
│   │   ├── questions/               # Question bank
│   │   ├── submissions/             # Student submissions
│   │   ├── grades/                  # Grading system
│   │   └── reports/                 # Analytics & reports
│   ├── dashboard/                   # Teacher dashboard
│   ├── ebooks/                      # Ebook management pages
│   ├── tests/                       # Test creation & management
│   ├── students/                    # Student management
│   ├── submissions/                 # Grading interface
│   ├── reports/                     # Analytics pages
│   ├── auth/                        # Authentication pages
│   └── layout.tsx                   # Root layout
│
├── components/                      # Reusable React components
│   ├── ui/                         # Shadcn/ui components
│   ├── dashboard/                  # Dashboard components
│   ├── ebook/                      # Ebook viewer components
│   ├── test/                       # Test builder components
│   ├── student/                    # Student test interface
│   ├── grading/                    # Grading components
│   └── reports/                    # Report components
│
├── lib/                            # Utility functions
│   ├── auth.ts                     # Authentication utilities
│   ├── db.ts                       # Database client
│   ├── pdf-generator.ts            # PDF generation
│   ├── docx-generator.ts           # Word document generation
│   ├── ebook-parser.ts             # Ebook text extraction
│   ├── validators.ts               # Input validation
│   └── utils.ts                    # General utilities
│
├── prisma/                         # Database schema
│   ├── schema.prisma               # Prisma schema
│   └── migrations/                 # Database migrations
│
├── public/                         # Static files
│   ├── logo.svg                    # KMR-EduVision logo
│   ├── favicon.ico
│   └── images/
│
├── styles/                         # Global styles
│   └── globals.css
│
├── .env.example                    # Environment variables template
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KishwarRasool/kmr-eduvision.git
cd kmr-eduvision
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```
DATABASE_URL="postgresql://user:password@localhost:5432/kmr_eduvision"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AWS_S3_BUCKET="your-bucket-name"
AWS_S3_REGION="us-east-1"
AWS_S3_ACCESS_KEY="your-access-key"
AWS_S3_SECRET_KEY="your-secret-key"
```

4. **Set up the database**
```bash
npm run db:push
npm run db:seed  # Optional: seed with sample data
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## Database Schema

### Core Tables

**users**
- id (UUID)
- email (String, unique)
- password (String, hashed)
- name (String)
- role (enum: TEACHER, ADMIN, STUDENT)
- school (String)
- createdAt (DateTime)
- updatedAt (DateTime)

**ebooks**
- id (UUID)
- teacherId (UUID) - FK to users
- title (String)
- description (Text)
- fileName (String)
- fileType (enum: PDF, EPUB)
- filePath (String)
- fileSize (BigInt)
- pages (Int)
- uploadedAt (DateTime)
- updatedAt (DateTime)

**chapters**
- id (UUID)
- ebookId (UUID) - FK to ebooks
- chapterNumber (Int)
- title (String)
- content (Text)
- pageStart (Int)
- pageEnd (Int)
- createdAt (DateTime)

**tests**
- id (UUID)
- teacherId (UUID) - FK to users
- ebookId (UUID) - FK to ebooks
- title (String)
- description (Text)
- instructions (Text)
- totalMarks (Int)
- passingMarks (Int)
- duration (Int) - in minutes
- status (enum: DRAFT, PUBLISHED, CLOSED)
- createdAt (DateTime)
- updatedAt (DateTime)

**questions**
- id (UUID)
- testId (UUID) - FK to tests
- ebookId (UUID) - FK to ebooks
- questionText (String)
- type (enum: MCQ, SHORT_ANSWER, ESSAY, TRUE_FALSE)
- difficulty (enum: EASY, MEDIUM, HARD)
- marks (Int)
- correctAnswer (String)
- explanation (Text)
- questionOrder (Int)
- createdAt (DateTime)

**questionOptions** (for MCQ)
- id (UUID)
- questionId (UUID) - FK to questions
- optionText (String)
- optionLetter (String) - A, B, C, D
- isCorrect (Boolean)

**testAssignments**
- id (UUID)
- testId (UUID) - FK to tests
- studentId (UUID) - FK to users
- assignedAt (DateTime)
- dueDate (DateTime)
- status (enum: ASSIGNED, IN_PROGRESS, SUBMITTED, GRADED)

**studentResponses**
- id (UUID)
- testAssignmentId (UUID) - FK to testAssignments
- questionId (UUID) - FK to questions
- answerText (String)
- selectedOption (String) - for MCQ
- marksObtained (Int)
- isCorrect (Boolean)
- submittedAt (DateTime)

**grades**
- id (UUID)
- testAssignmentId (UUID) - FK to testAssignments
- studentId (UUID) - FK to users
- totalMarks (Int)
- obtainedMarks (Int)
- percentage (Float)
- grade (String) - A, B, C, D, F
- feedback (Text)
- gradedAt (DateTime)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new teacher
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Ebooks
- `POST /api/ebooks/upload` - Upload new ebook
- `GET /api/ebooks` - List teacher's ebooks
- `GET /api/ebooks/:id` - Get ebook details
- `GET /api/ebooks/:id/chapters` - Get ebook chapters
- `DELETE /api/ebooks/:id` - Delete ebook

### Tests
- `POST /api/tests` - Create new test
- `GET /api/tests` - List teacher's tests
- `GET /api/tests/:id` - Get test details
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `GET /api/tests/:id/download-pdf` - Download test as PDF
- `GET /api/tests/:id/download-docx` - Download test as Word
- `POST /api/tests/:id/print` - Print test

### Questions
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions?testId=:id` - Get test questions

### Test Assignments
- `POST /api/assignments` - Assign test to students
- `GET /api/assignments` - Get assigned tests
- `GET /api/assignments/:id` - Get assignment details

### Submissions
- `POST /api/submissions` - Submit test
- `GET /api/submissions` - Get submissions for grading
- `PUT /api/submissions/:id/grade` - Grade submission

### Reports
- `GET /api/reports/student/:id` - Student performance report
- `GET /api/reports/class/:id` - Class analytics
- `GET /api/reports/topic-analysis` - Topic-wise analysis
- `GET /api/reports/download-pdf` - Download report as PDF
- `GET /api/reports/download-excel` - Download report as Excel

## Usage Guide

### For Teachers

1. **Upload Ebook**
   - Go to "Ebooks" section
   - Click "Upload Ebook"
   - Select PDF or EPUB file
   - System extracts content automatically

2. **Create Test**
   - Go to "Tests"
   - Click "Create New Test"
   - Select ebook and chapters
   - Add questions manually or from question bank
   - Set marks, duration, passing marks
   - Publish test

3. **Download/Print Test**
   - From test details page
   - Click "Download as PDF" or "Download as Word"
   - Or click "Print" to print directly
   - Choose options (with/without answers, multiple copies, etc.)

4. **Assign Test to Students**
   - Go to test details
   - Click "Assign Test"
   - Select students
   - Set due date
   - Send notifications

5. **Grade Submissions**
   - Go to "Submissions"
   - Review student answers
   - Enter marks for subjective questions
   - Add feedback
   - Publish grades

6. **View Analytics**
   - Go to "Reports"
   - View student performance
   - Class-wide analytics
   - Download reports

### For Students

1. **Take Test**
   - View assigned tests in dashboard
   - Click "Start Test"
   - Answer all questions
   - Submit before due date

2. **View Results**
   - After test is graded
   - View marks and feedback
   - Review correct answers

## Features Roadmap

### Phase 1 (Current)
- ✅ Ebook upload and management
- ✅ Test creation and builder
- ✅ PDF/Word download
- ✅ Print functionality
- ✅ Basic grading
- ✅ Student submission

### Phase 2
- Auto-question generation using AI
- Video integration for lessons
- Live classes support
- Mobile app
- SMS/Email notifications

### Phase 3
- Parent portal
- Attendance tracking
- Fee management
- Library management
- Advanced analytics with ML

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Add environment variables
5. Deploy

### Deploy to Other Platforms

See deployment guides:
- [Deploy to Railway](./docs/deploy-railway.md)
- [Deploy to Render](./docs/deploy-render.md)
- [Deploy to Self-Hosted Server](./docs/deploy-self-hosted.md)

## Security

- All passwords hashed with bcryptjs
- JWT tokens for authentication
- CORS protection
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- File upload validation
- Rate limiting on API endpoints

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email: support@kmr-eduvision.com

## Roadmap

- Q3 2024: MVP Launch
- Q4 2024: AI Features
- Q1 2025: Mobile App
- Q2 2025: Advanced Analytics

## Author

**Kishwar Rasool**
- GitHub: [@KishwarRasool](https://github.com/KishwarRasool)
- Email: kishwar@kmr-eduvision.com

---

**KMR-EduVision** - Illuminating Education 🌟
