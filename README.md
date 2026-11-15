# Alka Refrigeration 2.0 ❄️
### Full-Stack Appliance Repair & Service Platform

A modern, full-stack enterprise web application built using **Next.js (App Router)**, **React 18**, **Tailwind CSS**, and **MongoDB**.

> **Academic Submission:**  
> This application fulfills the combined learning outcomes for two university courses:  
> 1. **INT252** – Web Application Development with ReactJS  
> 2. **INT257** – Modern Web Application Development with Next.js  
>  
> Detailed unit-wise syllabus mappings are documented in [`PROJECT_ACADEMIC_MAPPING.md`](./PROJECT_ACADEMIC_MAPPING.md).

---

## 🌟 Key Features

### 1. Public Customer Experience
- **Hero & Trust Metrics:** Authentic business identity, 10+ years experience, 5000+ happy clients, 24/7 emergency helpline (+91 8090546021).
- **Service Catalog:** AC Repair & Jet Cleaning, Refrigerator Repair, Washing Machine, Deep Freezer, Water Cooler, and Annual Maintenance (AMC).
- **Doorstep Booking:** Controlled form built with **React Hook Form** + **Zod** schema validation. Includes auto-geolocation via OpenStreetMap.
- **Active Promotional Coupons:** Server-rendered promotional discounts with live coupon copying.
- **Interactive Work Gallery:** Real workshop images and on-site repair portfolio.

### 2. Customer Dashboard & Profile (`/profile`)
- **Google OAuth Login:** One-click Google Identity Services login with signed 7-day JWT tokens.
- **Profile Information:** View and update phone number and location.
- **Service Request Tracking:** Status timeline badges (`Pending`, `Called`, `Confirmed`, `On The Way`, `Completed`, `Cancelled`).
- **Booking Management:** Edit or cancel bookings prior to admin confirmation.
- **Online Bill Payment:** Integrated **Razorpay Checkout** with coupon discount calculation.
- **My Coupons:** View assigned or global active vouchers.

### 3. Comprehensive Admin Control Center (`/admin`)
- **Role-Based Access Control:** Secured route strictly restricted to verified administrators (`refrigerationalka@gmail.com`).
- **Live KPI Analytics:** Total bookings, pending jobs, completed jobs, registered customers, total collected revenue.
- **Complaints Management:** Filter tabs (`Pending`, `Done`, `All`) and real-time customer search.
- **Admin Workflow Actions:**
  - Confirm Customer Call
  - Assign Technician ("On The Way")
  - Set / Update Service Amount
  - Mark Work Completed
  - Admin Cancel with required explanation
- **Customer Directory:** Complete contact register of registered users.
- **Coupon Generator:** Create percentage or flat discount vouchers for all users or targeted individuals.
- **Excel Report Engine:** One-click downloads of `.xlsx` reports (Customers, Complaints, Service Type Analysis) powered by **ExcelJS**.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend Library:** React 18
- **Styling:** Tailwind CSS + Lucide React icons
- **Form Management:** React Hook Form + Zod
- **Global State:** Zustand + React Context API
- **Server State & Caching:** TanStack React Query v5
- **Database & ODM:** MongoDB Atlas + Mongoose 8
- **Authentication:** Google OAuth 2.0 (`google-auth-library`) + JWT (`jsonwebtoken`)
- **Payments:** Razorpay API + HMAC SHA256 Signature Verification
- **Reporting:** ExcelJS (.xlsx generator)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.17+` or `v20+` / `v24+`
- npm `v9+` or `v10+` / `v11+`
- MongoDB database (local or MongoDB Atlas connection string)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory (refer to `.env.example`):
```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/alka-refrigeration?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=alka123secret

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Admin Access
ADMIN_EMAIL=refrigerationalka@gmail.com
NEXT_PUBLIC_ADMIN_EMAIL=refrigerationalka@gmail.com

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
frontend-and-backend-project/
├── actions/                     # Next.js Server Actions
│   └── bookingActions.js
├── app/                         # Next.js App Router (Pages & APIs)
│   ├── about/                   # About page
│   ├── admin/                   # Secure Admin Dashboard
│   ├── api/                     # REST API Route Handlers
│   │   ├── admin/               # Admin endpoints & Excel export
│   │   ├── auth/                # Google OAuth login & profile update
│   │   ├── complaint/           # Booking CRUD & simulation payment
│   │   ├── coupons/             # Discount coupon endpoints
│   │   └── payment/             # Razorpay order & verification
│   ├── booking/                 # Dedicated booking page
│   ├── contact/                 # Contact & location map page
│   ├── products/                # Parts & equipment catalog
│   ├── profile/                 # Customer dashboard & bookings
│   ├── services/                # Services catalog
│   ├── layout.js                # Root Layout
│   ├── page.js                  # Homepage (ISR)
│   ├── loading.js               # Global Suspense spinner
│   ├── error.js                 # Global error boundary
│   └── not-found.js             # Custom 404 page
├── components/                  # Reusable UI & Layout Components
│   ├── dashboard/               # Modals (Payment, Edit, Cancel)
│   ├── forms/                   # Zod BookingForm
│   ├── layout/                  # Navbar, Footer, WhatsAppButton, BottomNav
│   ├── providers/               # TanStack Query Provider
│   └── ui/                      # Button, Card, Input, Modal, Badge
├── context/                     # React Context (AuthContext)
├── hooks/                       # Custom Hooks (useGeolocation, useBookings, useCoupons)
├── lib/                         # MongoDB cached connection, auth utils
├── models/                      # Mongoose Models (User, Complaint, Coupon)
├── public/                      # Static assets & images
├── schemas/                     # Zod Validation Schemas
├── store/                       # Zustand Stores (useBookingStore, useAdminStore)
├── _legacy_backup/              # Preserved original Express & HTML codebase
├── PROJECT_ACADEMIC_MAPPING.md  # Detailed INT252 & INT257 syllabus mapping
├── package.json
└── tailwind.config.js
```

---

## 🔒 Security & Code Quality

- **Zero Secret Leakage:** Database credentials and API secrets are strictly loaded via server-only modules and `.env.local`.
- **RBAC Enforcement:** Admin operations require both a valid token and verified admin email matching.
- **Input Sanitization:** All incoming requests are validated against strict Zod schemas on both client and server sides.
- **Preserved Legacy:** Original Express and HTML/CSS/JS source files are safely backed up in `_legacy_backup/`.

---

## 👨‍💻 Academic Evaluation Tips

During practical exams / viva:
1. Explain how **Zustand** is used for client UI state (draft bookings, active modals) while **TanStack React Query** handles server-state caching and invalidation.
2. Demonstrate how **Zod** validates inputs on the client before triggering network requests, and validates again inside Server Actions/Route Handlers for defence-in-depth security.
3. Show the **Razorpay** integration flow: Order creation on server -> Client checkout modal -> Signature verification with crypto HMAC SHA256 -> Database payment confirmation.
4. Show the **ExcelJS** report generator producing real `.xlsx` customer and complaints sheets from MongoDB.
