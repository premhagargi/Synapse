# Synapse AI - Automated Finance & Compliance Platform

A cutting-edge AI-powered platform that automates financial document analysis and compliance monitoring for modern teams. Synapse AI reads, understands, and extracts critical information from contracts, reports, and filings, saving hundreds of hours of manual review while ensuring regulatory compliance.

## 🚀 Key Features

### 🤖 AI-Powered Document Analysis
- **Instant Extraction**: Automatically pulls party names, investment amounts, dates, and critical clauses from any document
- **Risk-Aware Analysis**: AI flags non-standard terms, missing signatures, and potential compliance issues before they become problems
- **Natural Language Q&A**: Ask questions like "What's the deadline for the Series A filing?" and get instant, accurate answers
- **Executive Summaries**: 3-5 bullet point summaries that executives can understand in seconds

### 🔍 Compliance Intelligence
- **Automated Compliance Detection**: Identifies potential compliance risks and classifies them as "Compliance Issues" or "Internal/Process Issues"
- **Standards-Based Assessment**: Evaluates against industry standards (ISO, SOC 2, SOX, GDPR, etc.)
- **Risk Classification**: Determines whether findings represent true compliance violations or minor procedural deviations
- **Audit Trail**: Maintains detailed reasoning for each compliance classification

### 📊 Document Management
- **Secure Upload**: Drag and drop PDFs, Word documents, or scanned files with OCR digitization
- **Document History**: Review past analyses and findings with full search capabilities
- **Real-time Processing**: Get instant analysis and insights as soon as documents are uploaded
- **Structured Storage**: Organized storage with Firebase Firestore for scalability

### 📈 Analytics Dashboard
- **Document Overview**: Track total documents uploaded and processed
- **Compliance Monitoring**: Real-time view of compliance issues across all documents
- **Processing Status**: Monitor document analysis progress and completion rates
- **User Management**: Profile management with subscription tier tracking

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js 15 with React 18 and TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React hooks with Firebase real-time listeners
- **Forms**: React Hook Form with Zod validation

### Backend & AI
- **AI Engine**: Google's Genkit AI framework for document analysis
- **Cloud Infrastructure**: Firebase (Authentication, Firestore, Hosting)
- **Document Processing**: Base64 encoded document analysis with MIME type support
- **Schema Validation**: Zod schemas for type-safe AI interactions

### Key Technologies
- **Authentication**: Firebase Auth with email/password and social providers
- **Database**: Cloud Firestore with real-time queries and offline support
- **AI Integration**: Google AI (Gemini) for document understanding and analysis
- **File Processing**: Support for PDF, Word documents, and scanned images with OCR
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth user interactions

## 💼 Business Workflows

### 1. Document Upload & Processing
```
User uploads document → OCR text extraction → AI analysis → Structured data extraction → Compliance risk assessment → Summary generation
```

### 2. Compliance Review Process
```
Document analysis → Issue identification → Risk classification → Executive summary → User review → Action item creation
```

### 3. Continuous Monitoring
```
Document storage → Real-time analysis → Compliance tracking → Risk alerting → Historical reporting
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- Firebase project with enabled Authentication and Firestore
- Google AI API key for Genkit

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synapse-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your Firebase and Google AI credentials
   ```

4. **Firebase Configuration**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Update `src/firebase/config.ts` with your project credentials

5. **Development Server**
   ```bash
   # Start Next.js development server
   npm run dev

   # Start Genkit AI development server (in another terminal)
   npm run genkit:dev
   ```

6. **Access the application**
   - Open [http://localhost:9002](http://localhost:9002)
   - The AI analysis flows will be available at the Genkit development UI

### Project Structure

```
src/
├── ai/                 # AI flows and schemas
│   ├── flows/         # Document analysis workflows
│   ├── schemas.ts     # Zod schemas for AI inputs/outputs
│   └── genkit.ts      # AI configuration
├── app/               # Next.js app router pages
│   ├── dashboard/     # Main dashboard interface
│   ├── documents/     # Document management pages
│   ├── profile/       # User profile management
│   └── ...            # Authentication and landing pages
├── components/        # Reusable UI components
├── firebase/         # Firebase configuration and hooks
└── hooks/            # Custom React hooks
```

## 📋 Core Capabilities

### Document Analysis Features
- **Multi-format Support**: PDF, Word documents, scanned images
- **OCR Integration**: Automatic text extraction from images
- **Structured Extraction**: Party names, amounts, dates, deadlines
- **Compliance Flagging**: Automated risk identification
- **Executive Summaries**: Business-friendly summaries

### Compliance Intelligence
- **Standards Mapping**: ISO, SOC 2, SOX, GDPR compliance
- **Risk Classification**: Compliance vs Internal issues
- **Impact Assessment**: Severity and regulatory consequence evaluation
- **Audit Trail**: Detailed reasoning for all classifications

### User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Live data synchronization with Firebase
- **Intuitive Interface**: Clean, professional design for enterprise users
- **Fast Processing**: Sub-second analysis for most documents

## 🔧 API Reference

### AI Analysis Endpoints
- `analyzeDocument()` - Main document analysis function
- Input: `{ fileName: string, fileContent: dataURI }`
- Output: `{ summary: string, extractedData: {}, complianceIssues: [] }`

### Database Schema
- **Documents Collection**: Stores document metadata and analysis results
- **Users Collection**: User profiles and subscription information
- **Analysis Results**: Structured data extraction and compliance findings

## 🚀 Getting Started

1. **Upload Your First Document**
   - Navigate to the Documents page
   - Click "Upload New" and select your file
   - Wait for AI analysis to complete

2. **Review Analysis Results**
   - View executive summary
   - Check extracted data points
   - Review compliance issues

3. **Ask Questions**
   - Use natural language to query document details
   - Get instant answers about specific clauses or terms

## 💡 Use Cases

- **Investment Agreements**: Extract terms, amounts, and key dates
- **Compliance Reports**: Identify regulatory requirements and deadlines
- **Contract Review**: Flag non-standard clauses and missing signatures
- **Due Diligence**: Analyze multiple documents for risk assessment
- **Audit Preparation**: Identify compliance gaps and required actions

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Built with ❤️ using Next.js, Firebase, and Google AI**
