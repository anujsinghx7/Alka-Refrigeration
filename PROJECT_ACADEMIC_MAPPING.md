# ALKA REFRIGERATION 2.0 — ACADEMIC CURRICULUM MAPPING

**Course:** 5th Semester Computer Science / IT Engineering  
**Subject 1:** INT252 – Web Application Development with ReactJS  
**Subject 2:** INT257 – Modern Web Application Development with Next.js  
**Application Title:** Alka Refrigeration 2.0 (Commercial Full-Stack Web Platform)  
**Architecture:** Next.js App Router (Full-Stack), React 18, Tailwind CSS, MongoDB, Razorpay, ExcelJS  

---

## 1. INT252: WEB APPLICATION DEVELOPMENT WITH REACTJS

### Unit 1: Introduction to React & Component Architecture
* **Learning Outcome:** Understanding Virtual DOM, JSX syntax, component hierarchy, and component composition.
* **Implementation in Alka Refrigeration 2.0:**
  * **JSX & Functional Components:** Every UI view is broken down into modular functional components (`app/page.js`, `app/about/page.js`, `app/services/page.js`).
  * **Component Composition:** Nested layouts and reusable wrappers (`components/ui/Card.js`, `components/ui/Modal.js`, `components/layout/Navbar.js`, `components/layout/Footer.js`).
  * **Relevant Files:**
    * `components/ui/Button.js`
    * `components/ui/Card.js`
    * `components/ui/Modal.js`
    * `components/ui/Badge.js`
    * `components/layout/Navbar.js`
    * `components/layout/Footer.js`
  * **Viva / Demonstration Point:** Explain how the `Modal` and `Card` components use `children` props to achieve flexible component composition without coupling.

---

### Unit 2: Props, State & Event Handling
* **Learning Outcome:** Uni-directional data flow, immutable state updates, passing callbacks via props, handling synthetic events.
* **Implementation in Alka Refrigeration 2.0:**
  * **Props Passing & Typing:** Configurable button variants (`primary`, `secondary`, `outline`, `danger`), modal sizes, badge statuses passed through props.
  * **useState:** Local state for modals (`isPaymentOpen`, `isEditOpen`, `isCancelOpen`), search inputs (`searchQuery`), active section, and feedback alerts.
  * **Synthetic Events:** Form submissions (`onSubmit`), outside-click handling on dropdowns, modal backdrop click dismissals, copy-to-clipboard interactions.
  * **Relevant Files:**
    * `app/admin/page.js` (Lines 45–130: status filters, search query, modal open/close states)
    * `app/profile/page.js` (Lines 40–120: tab switching, profile field updates, copy coupon)
    * `components/dashboard/PaymentModal.js` (Lines 15–60: coupon select state, discount recalculation)
  * **Viva / Demonstration Point:** Show how updating the coupon dropdown immediately triggers state recalculation of the final payable amount in `PaymentModal.js`.

---

### Unit 3: React Hooks (Lifecycle, Calculations & Optimizations)
* **Learning Outcome:** Functional lifecycle management with `useEffect`, memoized calculations with `useMemo`, stable function references with `useCallback`, and custom hooks.
* **Implementation in Alka Refrigeration 2.0:**
  * **`useEffect`:** Navbar scroll listener, ESC key listener for accessible modals, synchronization of JWT session between `localStorage` and `document.cookie`.
  * **`useMemo`:**
    * `AuthContext.js`: Memoizing admin role derivation (`isAdmin = useMemo(...)`) and context value to prevent unnecessary re-renders of the tree.
    * `PaymentModal.js`: Memoizing discount calculation and coupon filtering based on service category.
  * **`useCallback`:**
    * `AuthContext.js`: Memoizing `loginWithGoogle`, `logout`, and `updateUserProfile`.
    * `hooks/useGeolocation.js`: Memoizing `detectLocation` for reliable execution across re-renders.
  * **Custom Hooks:**
    * `hooks/useGeolocation.js`: Wraps browser Geolocation API with OpenStreetMap reverse geocoding fallback, loading flags, and error boundary.
    * `hooks/useBookings.js`: Abstracts TanStack Query fetching for user complaints, admin stats, and customer directory.
    * `hooks/useCoupons.js`: Custom hook fetching public and user-specific discount coupons.
  * **Relevant Files:**
    * `context/AuthContext.js`
    * `hooks/useGeolocation.js`
    * `hooks/useBookings.js`
    * `hooks/useCoupons.js`
    * `components/dashboard/PaymentModal.js`
  * **Viva / Demonstration Point:** Demonstrate the `useGeolocation` custom hook: click "Auto Detect" on `/booking`, observe loading state, and see the latitude/longitude converted into a human-readable street address via Nominatim.

---

### Unit 4: Forms, Validation & Controlled Components
* **Learning Outcome:** Controlled components, two-way state binding, enterprise form validation using Zod and React Hook Form.
* **Implementation in Alka Refrigeration 2.0:**
  * **React Hook Form + Zod:** Form handling in `components/forms/BookingForm.js` using `zodResolver(bookingSchema)`.
  * **Validation Rules:**
    * Name: Minimum 2, maximum 60 characters.
    * Mobile: Strict regex `/^[6-9]\d{9}$/` ensuring valid 10-digit Indian numbers.
    * Service Location: Mandatory 3–200 characters.
    * Preferred Date: Must be a valid date from tomorrow onwards.
    * Service Category: Strict enum matching valid refrigeration services.
  * **Relevant Files:**
    * `schemas/bookingSchema.js`
    * `schemas/couponSchema.js`
    * `schemas/profileSchema.js`
    * `components/forms/BookingForm.js`
    * `components/ui/Input.js`
  * **Viva / Demonstration Point:** Try entering an invalid phone number (e.g., `12345` or letters) on `/booking` and submit. Show the real-time client validation error rendered by Zod.

---

### Unit 5: State Management (Local vs Global State)
* **Learning Outcome:** Managing complex application state using React Context API vs Zustand vs Server State.
* **Implementation in Alka Refrigeration 2.0:**
  * **React Context API (`context/AuthContext.js`):** Handles global user authentication, Google OAuth credentials, user profile synchronization, and role checks.
  * **Zustand (`store/useBookingStore.js`, `store/useAdminStore.js`):**
    * `useBookingStore`: Global booking draft, selected service, active modal controllers.
    * `useAdminStore`: Admin dashboard active tab (`dashboard`, `complaints`, `customers`, `coupons`, `reports`), work status filter, search query.
  * **TanStack React Query (`components/providers/QueryProvider.js`):**
    * Client-side server cache, query keys (`['user-bookings']`, `['admin-stats']`), automatic background revalidation, stale time configuration.
  * **Relevant Files:**
    * `context/AuthContext.js`
    * `store/useBookingStore.js`
    * `store/useAdminStore.js`
    * `components/providers/QueryProvider.js`
  * **Viva / Demonstration Point:** Explain the architectural difference between Context API (auth), Zustand (UI tabs/drafts), and React Query (server-state caching and invalidation).

---

## 2. INT257: MODERN WEB APPLICATION DEVELOPMENT WITH NEXT.JS

### Unit 1: Next.js App Router & File-Based Routing
* **Learning Outcome:** App Router directory convention, nested layouts, loading states, error boundaries, dynamic route segments.
* **Implementation in Alka Refrigeration 2.0:**
  * **Root Layout:** `app/layout.js` providing global HTML structure, fonts, providers, sticky navbar, mobile bottom navigation, and footer.
  * **Static & Public Routes:**
    * `app/page.js` (Home)
    * `app/about/page.js` (About Us)
    * `app/services/page.js` (All Services catalog)
    * `app/products/page.js` (Parts & Commercial Units)
    * `app/booking/page.js` (Doorstep booking form)
    * `app/contact/page.js` (Contact & Map)
    * `app/profile/page.js` (Customer profile & bookings)
    * `app/admin/page.js` (Admin dashboard)
  * **Dynamic Routes:**
    * `app/api/complaint/[id]/update/route.js`
    * `app/api/complaint/[id]/cancel/route.js`
    * `app/api/complaint/[id]/pay/route.js`
    * `app/api/admin/complaint/[id]/confirm/route.js`
    * `app/api/admin/complaint/[id]/update-status/route.js`
    * `app/api/admin/complaint/[id]/update-amount/route.js`
    * `app/api/admin/export/[type]/route.js`
  * **Special Files:**
    * `app/loading.js` (Global suspense loading spinner)
    * `app/error.js` (Error boundary with retry mechanism)
    * `app/not-found.js` (Custom 404 page with navigation)
  * **Viva / Demonstration Point:** Navigate to an invalid URL (e.g. `/unknown-path`) to show `app/not-found.js`, or simulate loading in `app/loading.js`.

---

### Unit 2: Rendering Strategies (SSR, SSG, ISR, CSR)
* **Learning Outcome:** Understanding Server Components vs Client Components, Incremental Static Regeneration (ISR), Static Site Generation (SSG), and Dynamic Server Rendering.
* **Implementation in Alka Refrigeration 2.0:**
  * **Static Site Generation (SSG):** Pages like `/about`, `/contact`, `/services`, `/products` are pre-rendered at build time for instant loading.
  * **Incremental Static Regeneration (ISR):**
    * `app/page.js` exports `export const revalidate = 60;`, rebuilding promotional offers in the background every 60 seconds without redeploying.
  * **Dynamic Server Rendering (SSR):**
    * Route Handlers reading cookies/headers (`/api/complaint/user`, `/api/admin/*`) export `export const dynamic = 'force-dynamic'`.
  * **Client Components (`'use client'`):**
    * Interactive UI components requiring DOM events, React hooks, or browser APIs (`BookingForm.js`, `PaymentModal.js`, `AuthContext.js`, `Navbar.js`).
  * **Relevant Files:**
    * `app/page.js` (ISR with `revalidate = 60`)
    * `app/api/coupons/route.js` (Dynamic execution)
    * `components/forms/BookingForm.js` (Client component)
  * **Viva / Demonstration Point:** Explain why `app/page.js` uses ISR (SEO and fast CDN caching of coupon offers) while `app/admin/page.js` and `app/profile/page.js` use client-side authentication guards.

---

### Unit 3: API Development (Route Handlers)
* **Learning Outcome:** Building RESTful API endpoints using Next.js App Router Route Handlers (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
* **Implementation in Alka Refrigeration 2.0:**
  * Migrated all legacy Express endpoints into Next.js Route Handlers:
    * `POST /api/auth/google-login`: Token verification & JWT creation.
    * `PUT /api/auth/update-profile`: Update user contact info.
    * `POST /api/complaint`: Create service booking.
    * `GET /api/complaint/user`: Get user's bookings with populated coupon data.
    * `PATCH /api/complaint/[id]/update`: Customer booking edits.
    * `PATCH /api/complaint/[id]/cancel`: Customer booking cancellations.
    * `POST /api/payment/create-order`: Razorpay order creation.
    * `POST /api/payment/verify`: Razorpay HMAC SHA256 signature verification.
    * `GET /api/coupons`: Public active coupons.
    * `GET /api/coupons/my-coupons`: User-eligible coupons.
    * `GET /api/admin/complaints`: Filtered admin complaint list.
    * `PATCH /api/admin/complaint/[id]/update-status`: Status updates.
    * `PATCH /api/admin/complaint/[id]/confirm`: Confirm customer call.
    * `PATCH /api/admin/complaint/[id]/update-amount`: Set service charge.
    * `PATCH /api/admin/complaint/[id]/cancel`: Admin cancellation with reason.
    * `POST /api/admin/coupons`: Issue new coupon.
    * `GET /api/admin/customers`: Customer directory.
    * `GET /api/admin/stats`: KPI aggregations.
    * `GET /api/admin/export/[type]`: Excel binary spreadsheet stream.
  * **Relevant Files:**
    * `app/api/**/*.js` (All route handlers)
  * **Viva / Demonstration Point:** Demonstrate `GET /api/coupons` in browser or curl, and `GET /api/admin/export/complaints` returning a real `.xlsx` file generated on the fly.

---

### Unit 4: Next.js Server Actions
* **Learning Outcome:** Direct database mutations from client/server forms without manual API boilerplate, with automatic cache revalidation.
* **Implementation in Alka Refrigeration 2.0:**
  * Implemented Server Actions with `'use server'` in `actions/bookingActions.js`:
    * `createBookingAction(formData)`: Directly parses `FormData`, validates with Zod, connects to MongoDB, saves complaint, and calls `revalidatePath('/profile')`.
    * `updateBookingAction(id, data)`: Server-side validation and mutation with cache revalidation.
    * `cancelBookingAction(id, reason)`: Server-side cancellation with cache revalidation.
  * **Relevant Files:**
    * `actions/bookingActions.js`
  * **Viva / Demonstration Point:** Explain how Server Actions eliminate the need for separate client-side `fetch` handlers and provide seamless progressive enhancement.

---

### Unit 5: Authentication, Authorization & Security
* **Learning Outcome:** Secure session management, JWT handling, role-based access control, environment security.
* **Implementation in Alka Refrigeration 2.0:**
  * **Google OAuth 2.0:** Server-side token verification using `google-auth-library`.
  * **JWT Session:** 7-day signed JWT tokens containing user ID, stored securely in HTTP cookies and localStorage.
  * **Role-Based Access Control (RBAC):** Admin route guard checking `role === 'admin'` and verifying `ADMIN_EMAIL=refrigerationalka@gmail.com`.
  * **Ownership Protection:** Customers can only view, edit, or cancel their own bookings.
  * **Relevant Files:**
    * `lib/auth.js`
    * `models/User.js`
    * `app/api/auth/google-login/route.js`
    * `app/admin/page.js`
  * **Viva / Demonstration Point:** Show how logging in with a regular Gmail account grants access to customer profile but blocks `/admin` with an "Access Denied" view, whereas the admin account unlocks full control.

---

### Unit 6: Database Integration with MongoDB & Mongoose
* **Learning Outcome:** Object-Document Mapping, connection caching in serverless/Node environments, data modeling, population, and aggregation pipelines.
* **Implementation in Alka Refrigeration 2.0:**
  * **Cached Connection:** `lib/mongodb.js` preserves connections in `global.mongoose` across development hot reloads.
  * **Data Models:**
    * `User`: Profiles, Google IDs, phone, location, roles.
    * `Complaint`: Service requests, workflow statuses, technician tracking, Razorpay order/payment IDs, cancellation metadata.
    * `Coupon`: Discount types (Flat vs Percentage), validity dates, applicability.
  * **MongoDB Aggregations:**
    * Total revenue sum (`$match: { paymentStatus: 'Paid' }`, `$group: { _id: null, total: { $sum: '$amount' } }`).
    * Service type breakdown in `app/api/admin/export/[type]/route.js`.
  * **Relevant Files:**
    * `lib/mongodb.js`
    * `models/User.js`
    * `models/Complaint.js`
    * `models/Coupon.js`
  * **Viva / Demonstration Point:** Show the Mongoose model schema definitions and explain how `Complaint.find().populate('userId')` performs relational joins in MongoDB.

---

### Unit 7: Performance, SEO & Media Optimization
* **Learning Outcome:** Metadata API, Open Graph protocol, Next.js Image component optimization, code splitting.
* **Implementation in Alka Refrigeration 2.0:**
  * **Next.js Metadata API:** Configured in `app/layout.js`, `app/about/page.js`, `app/services/page.js`, `app/products/page.js`, `app/booking/page.js`.
  * **Image Optimization:** Migrated all `<img>` tags to `next/image` with WebP/AVIF generation, automatic responsive sizing, and lazy loading.
  * **Font Optimization:** Google Fonts preconnected and styled with Tailwind typography.
  * **Relevant Files:**
    * `app/layout.js`
    * `next.config.mjs`
  * **Viva / Demonstration Point:** Inspect an image in Chrome DevTools to show how Next.js automatically serves optimized formats.

---

## 3. SUMMARY OF IMPLEMENTATION STATUS

| Feature / Syllabus Topic | Technology / Standard | Status | File Location |
| :--- | :--- | :--- | :--- |
| **Component Hierarchy & Props** | React 18, JSX, Props | Completed | `components/ui/*`, `components/layout/*` |
| **State & Lifecycle Hooks** | `useState`, `useEffect`, `useMemo`, `useCallback` | Completed | `context/AuthContext.js`, `app/admin/page.js` |
| **Custom Hooks** | Geolocation + Reverse Geocode | Completed | `hooks/useGeolocation.js` |
| **Form Validation** | React Hook Form + Zod | Completed | `components/forms/BookingForm.js`, `schemas/*` |
| **Global State Management** | Context API + Zustand | Completed | `context/AuthContext.js`, `store/*` |
| **Server State Management** | TanStack React Query v5 | Completed | `components/providers/QueryProvider.js`, `hooks/*` |
| **App Router Routing** | Next.js 14 App Router | Completed | `app/*` |
| **Dynamic Routes** | Parameterized Routes `[id]`, `[type]` | Completed | `app/api/**/[id]/*`, `app/api/**/[type]/*` |
| **Server Components & SSR** | React Server Components | Completed | `app/page.js`, `app/about/page.js`, etc. |
| **Incremental Static Regeneration** | `export const revalidate = 60` | Completed | `app/page.js` |
| **Server Actions** | Next.js Server Actions | Completed | `actions/bookingActions.js` |
| **REST Route Handlers** | Next.js Route Handlers | Completed | `app/api/**/route.js` |
| **MongoDB Atlas Integration** | Mongoose 8 + Connection Caching | Completed | `lib/mongodb.js`, `models/*` |
| **Authentication & RBAC** | Google OAuth + JWT + Role check | Completed | `lib/auth.js`, `app/api/auth/*` |
| **Payment Gateway** | Razorpay SDK + HMAC Verification | Completed | `app/api/payment/*`, `PaymentModal.js` |
| **Excel Export Engine** | ExcelJS | Completed | `app/api/admin/export/[type]/route.js` |
| **Responsive UI Design** | Tailwind CSS + Lucide React | Completed | `app/globals.css`, `tailwind.config.js` |
| **Legacy Code Preservation** | Clean backup in `_legacy_backup/` | Completed | `_legacy_backup/` |

---

## 4. UNIVERSITY EXAMINATION & VIVA DEMONSTRATION WORKFLOW

Follow these steps when demonstrating the project to internal and external examiners:

1. **Step 1: Start Application**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in the browser.

2. **Step 2: Demonstrate INT252 (ReactJS Concepts)**
   - Show component decomposition by inspecting `Navbar`, `Card`, `Button`, `Modal`.
   - Open `/booking`. Click **"Auto Detect"** to demonstrate the custom hook `useGeolocation`.
   - Show real-time Zod validation errors by submitting incomplete or invalid inputs.
   - Open Redux DevTools / React DevTools or state inspection to show the Zustand stores (`useBookingStore`, `useAdminStore`).
   - Sign in using Google OAuth to show React Context API (`AuthContext`) updating user state without page reload.

3. **Step 3: Demonstrate INT257 (Next.js Concepts)**
   - Demonstrate App Router folder structure (`app/layout.js`, `app/page.js`, `app/loading.js`, `app/error.js`, `app/not-found.js`).
   - Show Server Actions in `actions/bookingActions.js` handling direct mutations with `revalidatePath`.
   - Demonstrate Route Handlers by testing API endpoints in the browser/Postman (`/api/coupons`, `/api/complaint/user`).
   - Demonstrate Admin Authorization: Navigate to `/admin`. Show role-based access control protecting all admin endpoints.
   - In Admin Panel, click **"Export Excel"** under Reports to demonstrate dynamic Excel spreadsheet generation via ExcelJS.
   - Show Razorpay payment modal with coupon discount application in the customer profile (`/profile`).
