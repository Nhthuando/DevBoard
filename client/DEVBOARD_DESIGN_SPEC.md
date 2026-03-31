# DevBoard - Comprehensive Design Specification

## 1. Product Understanding

### Overview
DevBoard là nền tảng kết nối CLIENT (người tạo công việc) và DEV (người nhận công việc). Platform cho phép trao đổi công việc theo hình thức job posting, proposal submission, contract creation, payment escrow, và delivery review.

### Core Loop
```
CLIENT đăng job → DEV browse + apply → CLIENT accept proposal → tạo contract 
→ CLIENT nạp tiền escrow (Stripe) → DEV giao bài → CLIENT review delivery 
→ release payment → review DEV → notification center
```

### Key Features
- Job management (create, list, apply, close)
- Proposal system (with attachment upload)
- Contract creation & tracking
- Stripe escrow payment integration
- Delivery submission & review
- Dispute resolution
- Payment timeline & logs
- Event-based notifications
- Review system

### User Roles
| Role | Responsibilities |
|------|-------------------|
| **CLIENT** | Post jobs, review proposals, accept/reject, create contracts, manage escrow payments, review deliveries, release payments, create reviews, manage notifications |
| **DEV** | Browse jobs, apply with proposals, upload attachments, submit deliveries, view reviews, withdraw pending proposals, manage notifications |

---

## 2. Information Architecture & Sitemap

### Site Structure

```
DevBoard (Root)
│
├── Auth Flows
│   ├── Sign Up / Register
│   ├── Sign In / Login
│   └── Logout
│
├── CLIENT Area
│   ├── Dashboard
│   │   ├── Active Jobs (with proposal counts)
│   │   ├── Contracts Summary
│   │   ├── Recent Payments
│   │   └── Notifications Badge
│   │
│   ├── Jobs Management
│   │   ├── Create Job
│   │   ├── My Jobs List
│   │   │   └── Job Detail
│   │   │       ├── View Proposals (list)
│   │   │       │   └── Proposal Detail (accept/reject)
│   │   │       ├── Close Job
│   │   │       └── Manage Contract
│   │   └── Closed Jobs Archive
│   │
│   ├── Contracts Management
│   │   ├── Contracts List
│   │   │   └── Contract Detail
│   │   │       ├── Payment Status & History
│   │   │       ├── Delivery Review Interface
│   │   │       │   ├── Accept Delivery
│   │   │       │   └── Dispute Delivery
│   │   │       ├── Release Payment
│   │   │       └── Leave Review
│   │   └── Dispute Cases
│   │
│   ├── Payments Management
│   │   ├── Payment List (with timeline)
│   │   ├── Create Payment
│   │   ├── Stripe Checkout
│   │   ├── Payment Logs (webhooks tracking)
│   │   └── Escrow Balance
│   │
│   ├── Reviews & Ratings
│   │   ├── Create Review (after delivery acceptance)
│   │   └── View Reviews History
│   │
│   └── Notifications Center
│       ├── All Notifications
│       ├── Unread Filter
│       └── Mark as Read
│
├── DEV Area
│   ├── Dashboard
│   │   ├── Available Jobs (feed)
│   │   ├── My Proposals (active/withdrawn)
│   │   ├── My Contracts (active/completed)
│   │   ├── Received Reviews
│   │   └── Notifications Badge
│   │
│   ├── Jobs Browsing
│   │   ├── Jobs Feed (with filters)
│   │   │   └── Job Detail
│   │   │       └── Apply (create proposal)
│   │   │           ├── Upload Attachments
│   │   │           └── Submit Proposal
│   │   └── Saved/Favorites (optional Phase 2)
│   │
│   ├── Proposals Management
│   │   ├── My Proposals List
│   │   │   └── Proposal Detail
│   │   │       ├── View Status
│   │   │       └── Withdraw (if PENDING)
│   │   └── Submitted Proposals Archive
│   │
│   ├── Contracts Management
│   │   ├── My Contracts List
│   │   │   └── Contract Detail
│   │   │       ├── View Contract Terms
│   │   │       ├── Submit Delivery
│   │   │       │   └── Upload Deliverable Files
│   │   │       └── View Payment Status
│   │   └── Completed Contracts
│   │
│   ├── Reviews & Ratings
│   │   ├── Received Reviews List
│   │   └── View Profile with Rating
│   │
│   └── Notifications Center
│       ├── All Notifications
│       ├── Unread Filter
│       └── Mark as Read
│
└── Settings
    ├── Profile Management
    │   ├── Avatar Upload
    │   ├── Bio / Description
    │   └── Verification Status (future)
    ├── Account Settings
    │   ├── Email & Password
    │   ├── Privacy Preferences
    │   └── Notification Preferences
    └── Logout

```

### Navigation Pattern by Role

**CLIENT Navigation (Primary)**
- Dashboard → Jobs Management → Contracts → Payments → Reviews → Notifications

**DEV Navigation (Primary)**
- Dashboard → Browse Jobs → My Proposals → My Contracts → Reviews → Notifications

---

## 3. Screen Inventory

### Authentication (Universal)
- [ ] Sign Up / Register Page
- [ ] Sign In / Login Page
- [ ] Password Reset Flow (optional Phase 2)

### CLIENT Screens (14 screens)
1. [ ] CLIENT Dashboard
2. [ ] Create Job Form
3. [ ] My Jobs List
4. [ ] Job Detail (with proposals sidebar)
5. [ ] Proposal List Modal / Panel
6. [ ] Proposal Detail & Accept/Reject
7. [ ] Contract List
8. [ ] Contract Detail with Timeline
9. [ ] Delivery Review Interface
10. [ ] Dispute Modal / Form
11. [ ] Create Payment Form
12. [ ] Stripe Checkout
13. [ ] Payment Logs / History
14. [ ] Leave Review Form
15. [ ] Reviews Management
16. [ ] Notifications Center

### DEV Screens (12 screens)
1. [ ] DEV Dashboard
2. [ ] Jobs Feed / Browse
3. [ ] Job Detail View
4. [ ] Create Proposal (with file upload)
5. [ ] My Proposals List
6. [ ] Proposal Detail
7. [ ] My Contracts List
8. [ ] Contract Detail
9. [ ] Submit Delivery Form
10. [ ] Received Reviews
11. [ ] Profile with Ratings
12. [ ] Notifications Center

### Shared Screens
- [ ] Notifications Center (customized per role)
- [ ] Profile Settings
- [ ] Account Management

**Total: ~28-30 unique screens**

---

## 4. Detailed User Flows

### Flow 1: Auth & Onboarding
```
User Visit → Sign Up/Login
  ├─ Register: Email → Password → Role Selection (CLIENT/DEV) → Profile Setup → Dashboard
  └─ Login: Email → Password → Dashboard
```

### Flow 2: CLIENT - Create & Manage Job
```
CLIENT Dashboard
  ↓
Click "Create Job"
  ↓
Job Form: Title, Description, Budget Range, Category, Deadline
  ↓
Submit Job
  ↓
Job Status = OPEN
  ↓
View Proposals (real-time updates)
  ├─ Accept Proposal → Create Contract
  └─ Reject Proposal (optional feedback)
  
View Accepted Proposal → Create Contract
  ↓
Job Status = IN_PROGRESS
```

### Flow 3: DEV - Browse & Apply for Job
```
DEV Dashboard / Jobs Feed
  ↓
Filter/Search Jobs
  ↓
View Job Detail
  ↓
Click "Apply"
  ↓
Proposal Form: Offered Price, Description, Attachments
  ↓
Submit Proposal
  ↓
Proposal Status = PENDING
  ↓
Wait for CLIENT Decision or Withdraw
```

### Flow 4: CLIENT - Contract & Payment Setup
```
Accept Proposal → Create Contract
  ↓
Contract Status = ACTIVE
  ↓
Click "Create Payment" / "Fund Contract"
  ↓
Payment Form: Amount Confirmation
  ↓
Redirect to Stripe Checkout
  ↓
Complete Payment (Stripe)
  ↓
Payment Status = ESCROWED (funds locked)
  ↓
Notify DEV that payment is ready
```

### Flow 5: DEV - Submit Delivery
```
View ACTIVE Contract
  ↓
Click "Submit Delivery"
  ↓
Delivery Form: Description + File Upload
  ↓
Submit Delivery
  ↓
Notify CLIENT for review
  ↓
Wait for CLIENT Decision (Accept/Dispute)
```

### Flow 6: CLIENT - Review & Release Payment
```
Receive Delivery Submission Notification
  ↓
View Contract → Review Delivery
  ├─ Accept Delivery
  │   ↓
  │   Click "Release Payment"
  │   ↓
  │   Payment Status = RELEASED
  │   ↓
  │   Contract Status = COMPLETED
  │   ↓
  │   Prompt "Leave Review for DEV"
  │
  └─ Dispute Delivery
      ↓
      Dispute Form: Reason, Description
      ↓
      Dispute Status = OPEN
      ↓
      Payment Status = DISPUTED
      ↓
      Notify DEV + Support Team
```

### Flow 7: Leave & View Reviews
```
After Payment RELEASED
  ↓
Review Form: Rating (1-5 stars), Comment
  ↓
Submit Review
  ↓
DEV View Reviews in Profile/Dashboard
  ↓
Average Rating Calculated
```

### Flow 8: Notification Center
```
Any Event Triggered:
  - Proposal submitted
  - Proposal accepted/rejected
  - Contract created
  - Payment escrowed
  - Delivery submitted
  - Delivery accepted/disputed
  - Payment released
  - Review received
  ↓
Notification Created + Pushed
  ↓
User Views Notification Center
  ↓
Mark as Read
  ↓
Navigate to Related Contract/Job
```

---

## 5. Detailed Screen Specifications

### Template for Each Screen

**Screen Name**
- **Role**: CLIENT / DEV / Both
- **URL**: `/path`
- **Purpose**: Primary goal of the screen
- **Entry Points**: How users get here
- **Exit Points**: Where users go next

**Main Components**:
- Section 1 (description)
- Section 2 (description)
- CTA Buttons: Primary, Secondary, Tertiary

**States**:
- Loading
- Empty
- Populated
- Error
- Success

**Permissions**: Who can access + what actions are allowed

---

### 5.1 AUTH SCREENS

#### Sign Up / Register
- **Role**: Universal
- **Purpose**: New user registration with role selection
- **Exit Points**: Dashboard (after onboarding)

**Main Components**:
1. **Header**: "Tạo Tài Khoản" (Create Account)
2. **Form**:
   - Email field
   - Password field (with strength indicator)
   - Confirm password
   - Role selector: CLIENT / DEV (radio or toggle)
   - Terms & conditions checkbox
   - Sign up button
3. **Footer**: "Đã có tài khoản? Đăng nhập" (Already have account? Sign in)

**Validation**:
- Email format check
- Password min 8 chars, with special char
- Role must be selected
- Terms accepted
- Email uniqueness (backend)

**Error States**:
- Email already registered
- Passwords don't match
- Weak password

---

#### Sign In / Login
- **Role**: Universal
- **Purpose**: User authentication
- **Exit Points**: Dashboard (role-specific)

**Main Components**:
1. **Header**: "Đăng Nhập" (Sign In)
2. **Form**:
   - Email field
   - Password field
   - Remember me checkbox
   - Sign in button
3. **Footer**: "Chưa có tài khoản? Đăng ký" (Don't have account? Sign up)
4. **Password Recovery Link**: "Quên mật khẩu?" (Forgot password)

**Error States**:
- Invalid credentials
- Account not found
- Account disabled

---

### 5.2 CLIENT SCREENS

#### CLIENT Dashboard
- **Role**: CLIENT only
- **Purpose**: Central hub for job & contract management
- **URL**: `/dashboard` or `/client/dashboard`

**Main Components**:
1. **Header/Welcome**: "Xin chào [Name]" + Quick actions
2. **Stats Cards** (3-4 cards):
   - Active jobs (count)
   - Proposals received (count)
   - Active contracts (count)
   - Pending payments (amount)
3. **Recent Jobs Section** (Latest 5):
   - Job title, status badge, proposal count, created date
   - Quick action: View proposals, Close job
4. **Active Contracts Summary** (Latest 3-5):
   - Contract ID, Dev name, status, due date, payment status
   - Quick action: View detail, Release payment
5. **Recent Payments Timeline**:
   - Payment status, amount, date, action
6. **Notifications Bell**: Unread count + recent 3 notifications

**CTAs**:
- Primary: "Tạo Công Việc Mới" (Create New Job)
- Secondary: "Xem Tất Cả Công Việc" (View All Jobs), "Xem Tất Cả Hợp Đồng" (View All Contracts)

**Permissions**: CLIENT only

---

#### Create Job Form
- **Role**: CLIENT only
- **Purpose**: Post a new job to the platform
- **URL**: `/client/jobs/create`
- **Entry Point**: Dashboard "Create Job" button

**Main Components**:
1. **Form Fields**:
   - Job title (required, max 100 chars)
   - Category/Department (dropdown or select)
   - Description (rich text editor, required, min 50 chars)
   - Budget range (min - max price fields)
   - Deadline (date picker)
   - Skills required (tags input, optional)
   - Attachment (optional, file upload)
2. **Form States**:
   - Filled but invalid (highlight errors)
   - Valid (button enabled)
   - Submitting (spinner)
   - Success (toast + redirect to job detail)

**Validation**:
- All required fields filled
- Budget min ≤ max
- Deadline must be future date
- Description quality checks

**Error Handling**:
- Network error: Show retry message
- Validation errors: Highlight fields with inline messages

---

#### My Jobs List
- **Role**: CLIENT only
- **Purpose**: View and manage all posted jobs
- **URL**: `/client/jobs`

**Main Components**:
1. **Filter/Sort Bar**:
   - Status filter: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
   - Sort: Newest, Oldest, Most proposals
   - Search by title
2. **Jobs Table/Cards** (mobile: cards, desktop: table):
   - Job title, Status badge, Category
   - Proposals count, Created date
   - Budget range, Deadline
   - Actions: View detail, View proposals, Close job, Archive
3. **Pagination**: 10-20 items per page
4. **Empty State**: "Chưa có công việc nào. Hãy tạo một công việc mới" (No jobs yet)

**Status Badges**:
- OPEN: Green badge "Đang tuyển"
- IN_PROGRESS: Blue badge "Đang thực hiện"
- COMPLETED: Gray badge "Hoàn thành"
- CANCELLED: Red badge "Đã hủy"

---

#### Job Detail (CLIENT View)
- **Role**: CLIENT only
- **Purpose**: View job details, manage proposals, create contract
- **URL**: `/client/jobs/:jobId`

**Main Components**:
1. **Job Header**:
   - Job title, Status badge, Posted date
   - Budget range, Deadline, Category
   - View count, Proposal count
2. **Job Description**: Full description + attachments
3. **Proposals Panel** (collapsible or sidebar):
   - Proposal count
   - List of proposals (PENDING, ACCEPTED, REJECTED, WITHDRAWN)
   - For each proposal: Dev name, rating, offered price, submitted date
   - Actions: View detail, Accept, Reject
4. **Contract Section** (if accepted proposal exists):
   - Contract status, timeline
   - Payment status
   - Delivery status
5. **Action Buttons**:
   - Close job (if OPEN)
   - Archive job (if COMPLETED/CANCELLED)

**Conditional Display**:
- Show proposals panel only if status is not COMPLETED
- Show contract section only if contract exists
- "Close job" button only if status = OPEN

---

#### Proposal List Modal/Panel
- **Role**: CLIENT only
- **Purpose**: Detailed view of all proposals for a job
- **Trigger**: Click "View proposals" or access from job detail

**Main Components**:
1. **Filter Tabs**:
   - All, Pending, Accepted, Rejected, Withdrawn
2. **Proposal Cards** (list view):
   - Dev avatar, name, rating ⭐
   - Offered price, proposal date
   - Preview of proposal message (first 100 chars)
   - Status badge
   - Quick actions: View full detail, Accept, Reject, Withdraw (if applicable)
3. **Full Proposal Detail Modal**:
   - Dev profile info (avatar, name, ratings count, review snippets)
   - Full proposal message/description
   - Attached files (preview + download)
   - Offered price breakdown
   - Action buttons: Accept, Reject

**Permissions**:
- CLIENT can only accept/reject own job's proposals
- Only PENDING proposals can be accepted/rejected
- Accepted proposals can be reverted (status change)

---

#### Contract List (CLIENT)
- **Role**: CLIENT only
- **Purpose**: View and manage contracts
- **URL**: `/client/contracts`

**Main Components**:
1. **Filter/Status Tabs**:
   - All, Active, Completed, Disputed, Cancelled
2. **Contract Cards/Table**:
   - Contract ID (short), Dev name + avatar, rating
   - Job title, Status badge
   - Budget amount, Start date, Due date
   - Payment status indicator (color coded)
   - Delivery status (if applicable)
   - Last activity date
   - Actions: View detail, View delivery, Release payment (if applicable)
3. **Pagination**: 10-20 items per page
4. **Empty State**: "Chưa có hợp đồng nào"

**Status Badges & Colors**:
- ACTIVE: Blue - "Đang hoạt động"
- COMPLETED: Green - "Hoàn thành"
- DISPUTED: Orange - "Tranh chấp"
- CANCELLED: Gray - "Đã hủy"

---

#### Contract Detail (CLIENT)
- **Role**: CLIENT only
- **URL**: `/client/contracts/:contractId`
- **Purpose**: Full contract view, delivery review, payment management

**Main Components**:
1. **Contract Header**:
   - Contract ID, Job title, Status badge
   - Dev info: Avatar, name, rating, review count
   - Created date, Due date, Amount
2. **Timeline/Progress Section**:
   - Contract created → Payment escrowed → Delivery submitted → Delivery reviewed → Payment released
   - Visual timeline with dates & statuses
3. **Delivery Section** (if delivery exists):
   - Delivery submission date
   - Delivery description
   - Uploaded files (preview + download)
   - Delivery status: SUBMITTED, ACCEPTED, DISPUTED
   - If status = SUBMITTED:
     - "Accept Delivery" button → Release payment flow
     - "Dispute Delivery" button → Dispute form modal
   - If status = DISPUTED:
     - Dispute reason, status, timeline
     - Contact support link
4. **Payment Section**:
   - Payment amount, status (PENDING, ESCROWED, RELEASED, DISPUTED, REFUNDED)
   - Payment date, escrow date, release date
   - View payment logs button
   - "Release Payment" button (if status = ESCROWED and delivery ACCEPTED)
5. **Review Section** (if payment RELEASED):
   - Form: Rating (1-5 stars), Comment
   - Submit button
   - If already reviewed: Show review with date
6. **Actions**:
   - Primary: "Accept Delivery" (if SUBMITTED) or "Release Payment" (if accepted)
   - Secondary: "Dispute Delivery" (if SUBMITTED), "View Logs"
   - Tertiary: "Contact Dev" (message, Phase 2)

**Permissions**:
- Only CONTRACT creator (CLIENT) can view
- Can only accept/dispute if delivery status = SUBMITTED
- Can only release payment if status = ESCROWED and delivery = ACCEPTED

---

#### Delivery Review Modal
- **Role**: CLIENT only
- **Trigger**: Click "Accept Delivery" or "Dispute Delivery" on contract

**Accept Flow**:
1. Confirmation modal: "Xác nhận chấp nhận bài giao?" (Confirm accept delivery?)
2. Show delivery files preview (quick scan)
3. "Chấp nhận" (Accept) button → Marks delivery as ACCEPTED

**Dispute Flow**:
1. Dispute form:
   - Dispute reason (dropdown): Quality issues, Incomplete work, Other
   - Detailed description (required, min 50 chars)
   - Optional: Screenshot/file upload
   - Button: "Gửi Tranh Chấp" (Submit Dispute)
2. Success: Show confirmation + next steps

---

#### Create Payment Form
- **Role**: CLIENT only
- **Purpose**: Initiate escrow payment for contract
- **URL**: `/client/contracts/:contractId/payment/create`
- **Trigger**: Contract detail "Create Payment" button

**Main Components**:
1. **Payment Summary**:
   - Dev name, Job title, Contract amount (from proposal)
2. **Amount Confirmation**:
   - Display amount (read-only, from contract)
   - Currency selector (if applicable, else fixed VND/USD)
3. **Payment Method** (Stripe):
   - Stripe payment form component
   - Card input fields (with validation)
4. **Terms Checkbox**:
   - "Tôi đồng ý với các điều khoản thanh toán" (I agree with payment terms)
5. **Action Buttons**:
   - Primary: "Tiếp tục thanh toán" (Proceed to checkout)
   - Secondary: "Hủy" (Cancel)

**Validation**:
- Amount must be positive
- Payment method must be filled
- Terms checkbox must be checked

**States**:
- Loading (during Stripe setup)
- Processing (during payment)
- Success → Redirect to Stripe checkout
- Error → Show error message with retry

---

#### Stripe Checkout
- **Role**: CLIENT only
- **Purpose**: Finalize payment via Stripe
- **Trigger**: After "Proceed to checkout"
- **Handling**: Stripe hosted checkout or iframe

**Components**:
- Stripe payment form
- Order summary (amount, fee)
- Security badges
- Outcome: Success/Failure notification

**Post-Payment**:
- Success: Payment status = ESCROWED, notification sent to DEV
- Failure: Show error, allow retry
- Webhook: Verify payment in backend

---

#### Payment Logs / History
- **Role**: CLIENT only
- **URL**: `/client/payments` or `/client/contracts/:contractId/logs`
- **Purpose**: View all payment transactions and Stripe webhook events

**Main Components**:
1. **Filter/Status**:
   - By status: PENDING, ESCROWED, RELEASED, REFUNDED, DISPUTED
   - By date range
   - Search by contract ID
2. **Payment Timeline Table**:
   - Payment ID, Contract ID, Amount, Status, Type
   - Created date, Escrowed date, Released date, Refund date
   - Webhook events (received, processed, error)
   - Actions: View detail, View logs
3. **Payment Detail Modal**:
   - Full payment info
   - Stripe transaction ID
   - Webhook event log (timestamp, event type, payload)
   - Developer info (for debugging)

**Empty State**: "Chưa có thanh toán nào"

---

#### Leave Review Form
- **Role**: CLIENT only (after payment RELEASED)
- **Trigger**: Contract detail or prompt after payment release
- **Embedded on**: Contract detail page

**Main Components**:
1. **Dev Info Preview**: Avatar, name
2. **Rating Section**:
   - 5-star rating selector (interactive, hover effect)
   - Selected count display
3. **Comment Section**:
   - Text area (min 20 chars, max 500 chars)
   - Character count
4. **Action Buttons**:
   - Primary: "Gửi Đánh Giá" (Submit Review)
   - Secondary: "Bỏ Qua" (Skip)

**Validation**:
- Rating must be selected
- If rating < 3: require comment
- Comment min 20 chars (if required)

**Success**: Toast confirmation + review appears in timeline

---

#### Reviews Management
- **Role**: CLIENT only
- **URL**: `/client/reviews`
- **Purpose**: View reviews the client has written about devs

**Main Components**:
1. **Reviews List**:
   - Dev name, avatar, rating given
   - Comment preview
   - Date submitted
   - Actions: View full, Edit, Delete
2. **Review Detail**:
   - Full comment, date, contract reference
   - Edit capability

---

#### Notifications Center (CLIENT)
- **Role**: CLIENT
- **URL**: `/notifications`
- **Purpose**: Centralized notification hub

**Main Components**:
1. **Filter Tabs**:
   - All, Unread, Proposals, Contracts, Payments, Reviews
2. **Notifications List** (with infinite scroll or pagination):
   - Notification icon (by type)
   - Title, preview text, timestamp
   - Unread indicator (dot/badge)
   - Hover: "Mark as read" action
   - Click: Navigate to related resource
3. **Notification Types**:
   - "DEV_PROPOSED": "[Dev name] gửi proposal cho [Job]"
   - "PROPOSAL_ACCEPTED": "Bạn đã chấp nhận proposal từ [Dev]"
   - "DELIVERY_SUBMITTED": "[Dev] đã gửi bài giao cho [Contract]"
   - "PAYMENT_ESCROWED": "Thanh toán đã được tạm giữ cho [Contract]"
   - "REVIEW_RECEIVED": "[Dev] đã viết đánh giá cho bạn"
   - "DISPUTE_FILED": "Tranh chấp đã được ghi nhận cho [Contract]"
4. **Mark as Read**: Bulk action for all unread

---

### 5.3 DEV SCREENS

#### DEV Dashboard
- **Role**: DEV only
- **Purpose**: Central hub for job browsing and contract tracking
- **URL**: `/dashboard` or `/dev/dashboard`

**Main Components**:
1. **Header/Welcome**: "Xin chào [Name]" + Quick actions
2. **Stats Cards** (4 cards):
   - Available jobs (count)
   - My proposals (PENDING count)
   - Active contracts (count)
   - Average rating ⭐
3. **Recommended Jobs** (Latest 5-8):
   - Job title, budget range, category
   - Company/Client name
   - Proposal count (indicator of competition)
   - Posted date
   - Quick action: View detail, Apply
   - Highlighted if matching skills (future feature)
4. **My Active Proposals** (Latest 3):
   - Job title, status, offered price, created date
   - Quick action: View detail, Withdraw (if PENDING)
5. **My Active Contracts** (Latest 3):
   - Job title, Client name, status, due date
   - Payment status indicator
   - Quick action: View detail, Submit delivery
6. **Received Reviews** (Latest 3):
   - Client name, rating, comment preview, date
7. **Notifications Bell**: Unread count

**CTAs**:
- Primary: "Duyệt Công Việc" (Browse Jobs)
- Secondary: "Xem Tất Cả Proposals" (View All Proposals), "Xem Hợp Đồng" (View Contracts)

---

#### Jobs Feed / Browse
- **Role**: DEV only
- **Purpose**: Discover and apply for available jobs
- **URL**: `/dev/jobs` or `/jobs`

**Main Components**:
1. **Search & Filter Bar**:
   - Search by keyword (job title, description)
   - Filter by:
     - Category/Department
     - Budget range (slider)
     - Deadline (time remaining)
     - Status: New (< 24h), Active, Closing soon
   - Sort by: Newest, Budget (high to low), Deadline (soon first)
2. **Jobs List** (infinite scroll or pagination):
   - Job card layout:
     - Title, Category badge
     - Budget range, Deadline
     - Description preview (first 150 chars)
     - Client name (optional, depend on privacy)
     - Proposal count indicator
     - Posted date
     - Status indicator (new, closing soon)
   - Click to view detail or apply
3. **Pagination/Infinite Scroll**: Load more at bottom
4. **Empty State**: "Không có công việc nào phù hợp. Thử thay đổi bộ lọc." (No jobs match criteria)

**Responsive**:
- Desktop: Grid layout (2-3 columns)
- Mobile: Single column

---

#### Job Detail (DEV View)
- **Role**: DEV only
- **URL**: `/jobs/:jobId` or `/dev/jobs/:jobId`
- **Purpose**: View complete job info, decide to apply

**Main Components**:
1. **Job Header**:
   - Job title, Category badge, Posted date
   - Budget range, Deadline (with time remaining indicator)
   - Status (OPEN, IN_PROGRESS, COMPLETED)
   - Proposal count
   - View count
2. **Client Info** (summary):
   - Client name, avatar
   - Rating & review count
   - Member since date
3. **Full Job Description**:
   - Description text
   - Attached files (if any)
   - Skills required (tags)
4. **Similar Jobs** (optional, Phase 2):
   - Carousel of 3-5 similar jobs
5. **Action Section**:
   - "Gửi Proposal" (Submit Proposal) button - primary
   - "Lưu Công Việc" (Save Job) button - secondary (Phase 2)

**Conditional Logic**:
- Hide apply button if DEV has already applied (show "Đã gửi proposal" badge instead)
- Hide apply button if job status ≠ OPEN
- Show "Gọi thầu" (Closed) if job status = COMPLETED

**Permissions**:
- DEV can only view (not edit)
- Apply button only if OPEN status
- One proposal per DEV per job

---

#### Create Proposal Form
- **Role**: DEV only
- **Trigger**: Click "Gửi Proposal" on job detail
- **URL**: `/jobs/:jobId/apply`
- **Purpose**: Submit a job application with proposal details

**Main Components**:
1. **Job Summary** (read-only):
   - Job title, budget range, deadline
2. **Proposal Form**:
   - Offered price (required, must be within reasonable range)
     - Input field with currency selector
   - Proposal message (required, min 100 chars, max 2000 chars)
     - Rich text editor or textarea
     - Character count
   - Attachments (optional, max 5 files, 10MB each):
     - File upload drag-drop area
     - File list with delete option
     - Allowed: PDF, DOC, XLS, ZIP, etc.
3. **Cover Letter Preview**: Show formatted preview as user types
4. **Action Buttons**:
   - Primary: "Gửi Proposal" (Submit)
   - Secondary: "Hủy" (Cancel)

**Validation**:
- Price must be positive number
- Price within reasonable range (1M - 500M VND, or min/max from job budget)
- Message min 100 chars
- Required fields filled
- File size limits respected

**States**:
- Draft (unsaved)
- Dirty (changes made)
- Submitting (spinner)
- Success (confirmation toast + redirect to my proposals)
- Error (show validation/network errors)

---

#### My Proposals List
- **Role**: DEV only
- **URL**: `/dev/proposals`
- **Purpose**: View all submitted proposals

**Main Components**:
1. **Filter/Status Tabs**:
   - All, Pending, Accepted, Rejected, Withdrawn
2. **Proposals Table/Cards**:
   - Job title, Client name, offered price
   - Status badge (color coded)
   - Submitted date, Last updated date
   - Actions: View detail, Withdraw (if PENDING), View contract (if ACCEPTED)
3. **Pagination**: 10-20 items per page
4. **Empty State**: "Chưa gửi proposal nào"

**Status Badges**:
- PENDING: Blue - "Chờ phản hồi"
- ACCEPTED: Green - "Được chấp nhận"
- REJECTED: Red - "Bị từ chối"
- WITHDRAWN: Gray - "Đã rút"

---

#### Proposal Detail (DEV View)
- **Role**: DEV only
- **URL**: `/dev/proposals/:proposalId`
- **Purpose**: View own proposal details and status

**Main Components**:
1. **Proposal Header**:
   - Job title, Client name, Status badge
   - Submitted date, Last updated date
2. **Proposal Content** (read-only):
   - Offered price
   - Proposal message
   - Attached files (download links)
3. **Job Context**:
   - Job title, budget range (for comparison)
4. **Status Timeline**:
   - Submitted → [PENDING] → [ACCEPTED/REJECTED]
   - If accepted: Contract created date
5. **Actions**:
   - If PENDING: "Rút Proposal" (Withdraw) button
   - If ACCEPTED: "Xem Hợp Đồng" (View Contract) button
   - Always: "Quay Lại" (Back) button

---

#### My Contracts List (DEV)
- **Role**: DEV only
- **URL**: `/dev/contracts`
- **Purpose**: View and manage accepted contracts

**Main Components**:
1. **Filter/Status Tabs**:
   - All, Active, Completed, Disputed, Cancelled
2. **Contracts Table/Cards**:
   - Job title, Client name + avatar, rating
   - Amount, Status badge, Due date
   - Payment status indicator
   - Delivery status (if applicable)
   - Created date, Last activity
   - Actions: View detail, Submit delivery (if applicable), View payment status
3. **Pagination**: 10-20 items per page
4. **Empty State**: "Chưa có hợp đồng nào"

---

#### Contract Detail (DEV View)
- **Role**: DEV only
- **URL**: `/dev/contracts/:contractId`
- **Purpose**: Full contract view, submit delivery

**Main Components**:
1. **Contract Header**:
   - Job title, Client name, avatar, rating
   - Contract ID, Status badge
   - Amount, Created date, Due date
2. **Timeline/Progress**:
   - Contract created → Payment escrowed → [Delivery submitted/awaiting] → [Delivery accepted/disputed] → Payment released
   - Visual timeline with current status
3. **Contract Details** (read-only):
   - Job description, budget, terms
4. **Delivery Section**:
   - If no delivery yet:
     - "Gửi Bài Giao" (Submit Delivery) button - primary
     - Delivery checklist (optional):
       - Expected deliverables
       - Client requirements
   - If delivery submitted:
     - Delivery message, files, submission date
     - Status: SUBMITTED, ACCEPTED, DISPUTED
     - View client review (if ACCEPTED)
   - If delivery ACCEPTED:
     - Show acceptance date
     - Show client review (if written)
   - If delivery DISPUTED:
     - Show dispute reason, timeline
     - Contact support link
5. **Payment Section**:
   - Amount, payment status
   - "View Payment Logs" button
   - Payment timeline (dates when escrowed, disputed, released, etc.)

**Permissions**:
- Only DEV who accepted the contract can view
- Can only submit delivery once (unless resubmitted after dispute)
- Read-only contract details

---

#### Submit Delivery Form
- **Role**: DEV only
- **Trigger**: Click "Gửi Bài Giao" on contract detail
- **URL**: `/dev/contracts/:contractId/delivery/submit`
- **Purpose**: Submit work/deliverables to client

**Main Components**:
1. **Contract Summary** (read-only):
   - Job title, Client name, Due date, Amount
2. **Delivery Form**:
   - Delivery message (required, min 100 chars):
     - Rich text editor or textarea
     - Describe what's delivered, how to use, notes
   - Deliverable files (required, at least 1):
     - File upload drag-drop area
     - Max 10 files, 50MB total
     - Show file list with preview + delete option
     - Allowed: Most file types (image, doc, video, code, zip, etc.)
   - Checklist (optional, for organization):
     - Pre-defined items dev can check off
     - "All requirements met", "Tested and working", etc.
3. **Preview Section**:
   - Show formatted delivery message and file list
4. **Action Buttons**:
   - Primary: "Gửi Bài Giao" (Submit Delivery)
   - Secondary: "Hủy" (Cancel)

**Validation**:
- Message min 100 chars
- At least 1 file uploaded
- All file size limits respected
- File type validation (no exe, script, etc.)

**States**:
- Drafting
- Submitting (spinner, block form)
- Success (toast + contract detail shows delivery submitted)
- Error (validation or network errors)

**Success Flow**:
- Delivery status = SUBMITTED
- Client notification sent
- DEV sees delivery in contract detail as "Đang chờ xem xét" (Under review)

---

#### Received Reviews (DEV Profile/Reviews)
- **Role**: DEV only
- **URL**: `/dev/reviews` or `/profile/reviews`
- **Purpose**: View all reviews received from clients

**Main Components**:
1. **Profile Summary**:
   - Avatar, name, rating (average)
   - Total reviews count
   - Completion rate (optional)
2. **Rating Distribution** (visual):
   - 5-star: count & percentage
   - 4-star: count & percentage
   - 3-star: count & percentage
   - 2-star: count & percentage
   - 1-star: count & percentage
3. **Reviews List**:
   - For each review:
     - Client avatar, name
     - Rating (stars)
     - Comment/review text
     - Job title, contract date
     - Actions: Report (if inappropriate, Phase 2)
4. **Sorting**: Latest, Highest rated, Lowest rated
5. **Empty State**: "Chưa nhận đánh giá nào" (No reviews yet)

**Permissions**:
- DEV can only view own reviews (created about them)
- Read-only

---

#### DEV Profile with Rating
- **Role**: DEV (own view), CLIENT (other view)
- **URL**: `/dev/:devId` or `/profile/:devId`
- **Purpose**: Public profile showing DEV credentials and reviews

**Main Components** (visible to CLIENT):
1. **Header**:
   - Avatar, name, overall rating ⭐
   - "Tham gia từ [date]" (Member since)
   - Completion rate (contracts completed / total)
   - Response time (average, if tracked)
2. **Bio Section**:
   - Short bio/description
   - Skills/specialties (tags)
3. **Reviews Section** (summary + reviews list):
   - Average rating, total reviews count
   - Recent reviews (last 5)
   - "Xem Tất Cả Đánh Giá" (View All Reviews) link
4. **Portfolio** (optional Phase 2):
   - Featured projects/past work links
5. **Availability Status** (optional):
   - Available, Busy, On vacation

**Permissions**:
- Public view: Read-only
- DEV's own view: Can edit bio, skills (Phase 2)

---

#### Notifications Center (DEV)
- **Role**: DEV
- **URL**: `/notifications`
- **Purpose**: Centralized notification hub

**Main Components** (similar to CLIENT, but DEV-specific types):
1. **Filter Tabs**:
   - All, Unread, Jobs, Proposals, Contracts, Reviews, Payments
2. **Notifications List**:
   - Icon, title, preview, timestamp, unread indicator
   - Click to navigate to resource
3. **Notification Types**:
   - "JOB_POSTED": "[Job] đã được đăng"
   - "PROPOSAL_DECISION": "Proposal cho [Job] đã được [ACCEPTED/REJECTED]"
   - "CONTRACT_CREATED": "Hợp đồng cho [Job] đã được tạo"
   - "PAYMENT_ESCROWED": "Thanh toán đã được tạm giữ cho [Contract]"
   - "DELIVERY_DECISION": "[CLIENT] đã [ACCEPT/DISPUTE] bài giao của bạn"
   - "PAYMENT_RELEASED": "Thanh toán cho [Contract] đã được phát hành"
   - "REVIEW_CREATED": "[CLIENT] đã viết đánh giá cho bạn"
4. **Mark as Read**: Bulk action

---

### 5.4 SHARED SCREENS

#### Profile Settings
- **Role**: CLIENT & DEV
- **URL**: `/settings/profile`
- **Purpose**: Manage user profile information

**Main Components**:
1. **Avatar Section**:
   - Current avatar display
   - Upload/change avatar button
   - Crop tool (optional)
2. **Profile Info Form**:
   - Full name (required)
   - Email (display only, change via account settings)
   - Phone (optional)
   - Bio/description (textarea, 500 chars max)
   - **For DEV only**: Skills/specialties (tags)
3. **Action Buttons**:
   - Save changes (enabled when dirty)
   - Cancel

**Validation**:
- Name min 3 chars
- Email format (if editable)
- Phone format validation

---

#### Account Settings
- **Role**: CLIENT & DEV
- **URL**: `/settings/account`
- **Purpose**: Manage account security and preferences

**Main Components**:
1. **Email & Password**:
   - Current email (display + change button)
   - Change password form (old password → new → confirm)
   - Two-factor authentication (optional Phase 2)
2. **Privacy & Notifications**:
   - Email notification preferences (toggles):
     - Proposal notifications
     - Contract notifications
     - Payment notifications
     - Review notifications
   - Marketing emails (opt-in)
3. **Data & Account**:
   - Download my data (GDPR, Phase 2)
   - Delete account (with confirmation)
4. **Session Management** (optional):
   - Active sessions list
   - Logout all sessions button

**Permissions**:
- Users can only modify own settings
- Email change requires verification

---

## 6. Component System & Design Tokens

### 6.1 Design Tokens

```css
/* Colors */
--primary: #007AFF;        /* Apple blue - main brand color */
--primary-dark: #0051CC;
--primary-light: #E3F2FD;

--secondary: #10B981;      /* Emerald - success, positive */
--secondary-dark: #059669;
--secondary-light: #D1FAE5;

--danger: #EF4444;         /* Red - error, dangerous */
--danger-dark: #DC2626;
--danger-light: #FEE2E2;

--warning: #F59E0B;        /* Amber - warning, caution */
--warning-dark: #D97706;
--warning-light: #FEF3C7;

--neutral-dark: #1F2937;   /* Dark gray - text, backgrounds */
--neutral: #6B7280;        /* Medium gray - secondary text */
--neutral-light: #E5E7EB;  /* Light gray - borders, dividers */
--neutral-lighter: #F3F4F6;/* Very light gray - bg */
--white: #FFFFFF;
--black: #000000;

/* Typography */
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
--font-family-mono: 'Courier New', Courier, monospace;

--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;

--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Z-Index */
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal: 400;
--z-tooltip: 500;
```

### 6.2 Component Library

#### Buttons

**Variants**:
1. **Primary Button** (main CTAs)
   - Background: `--primary`
   - Text: white
   - Hover: `--primary-dark` (darker shade)
   - Disabled: gray background, disabled text color
   - Padding: `8px 16px` (small), `12px 24px` (medium)
   - Radius: `--radius-md`
   - Font-weight: medium
   - Size options: sm, md, lg

2. **Secondary Button** (alternative actions)
   - Background: `--neutral-lighter`
   - Text: `--primary`
   - Border: 1px solid `--neutral-light`
   - Hover: background lighter, border darker
   - Disabled: gray

3. **Danger Button** (destructive actions)
   - Background: `--danger`
   - Text: white
   - Hover: `--danger-dark`
   - For actions like "Delete", "Reject", "Dispute"

4. **Ghost Button** (minimal, text-only)
   - Background: transparent
   - Text: `--primary`
   - Border: none
   - Underline on hover
   - For secondary navigation or links

5. **Disabled State**:
   - All buttons: opacity 0.5, cursor not-allowed
   - Never hide disabled buttons, always show disabled state

---

#### Badges / Status Indicators

**Status Badges** (color-coded):
```
JOB Status:
- OPEN: Green (#10B981) - "Đang tuyển"
- IN_PROGRESS: Blue (#007AFF) - "Đang thực hiện"
- COMPLETED: Gray (#6B7280) - "Hoàn thành"
- CANCELLED: Red (#EF4444) - "Đã hủy"

PROPOSAL Status:
- PENDING: Yellow/Amber (#F59E0B) - "Chờ phản hồi"
- ACCEPTED: Green (#10B981) - "Được chấp nhận"
- REJECTED: Red (#EF4444) - "Bị từ chối"
- WITHDRAWN: Gray (#6B7280) - "Đã rút"

CONTRACT Status:
- ACTIVE: Blue (#007AFF) - "Đang hoạt động"
- COMPLETED: Green (#10B981) - "Hoàn thành"
- DISPUTED: Orange (#F59E0B) - "Tranh chấp"
- CANCELLED: Gray (#6B7280) - "Đã hủy"

PAYMENT Status:
- PENDING: Yellow (#F59E0B) - "Chờ xử lý"
- ESCROWED: Blue (#007AFF) - "Tạm giữ"
- RELEASED: Green (#10B981) - "Đã phát hành"
- REFUNDED: Purple (new color) - "Hoàn trả"
- DISPUTED: Orange (#F59E0B) - "Tranh chấp"

DELIVERY Status:
- SUBMITTED: Yellow (#F59E0B) - "Chờ xem xét"
- ACCEPTED: Green (#10B981) - "Chấp nhận"
- DISPUTED: Orange (#F59E0B) - "Tranh chấp"
```

**Badge Styling**:
- Padding: `4px 12px`
- Radius: `--radius-full`
- Font-size: `--font-size-sm` (12px)
- Font-weight: medium
- Background: status color with 10% opacity
- Text: status color (darker)
- Inline display or block depending on context

---

#### Input Fields

**Text Input**:
- Border: 1px solid `--neutral-light`
- Padding: `12px 16px`
- Radius: `--radius-md`
- Font-size: `--font-size-base`
- Focus: Border color = `--primary`, shadow = soft blue glow
- Error state: Border = `--danger`, error message below
- Disabled state: Background = `--neutral-lighter`, cursor not-allowed

**Textarea**:
- Similar to text input but larger height (min 120px)
- Resize: vertical only
- Character count indicator at bottom

**Select Dropdown**:
- Similar styling to text input
- Arrow icon on right side
- Dropdown menu styling (see dropdown component)

**Checkbox & Radio**:
- Size: 16x16px for checkbox, 16px diameter for radio
- Color: `--primary` when checked
- Label: clickable, positioned right of input
- Group label for related checkboxes

**Date Picker**:
- Input field with calendar icon
- Click opens calendar modal/picker
- Show selected date in input

**File Upload**:
- Drag-drop area: dashed border, light background
- "Click to upload or drag files here"
- File list below with delete buttons
- Progress indicator during upload

---

#### Cards

**Card Layout**:
- Background: white
- Border: 1px solid `--neutral-light`
- Radius: `--radius-lg`
- Padding: `--space-lg` (24px)
- Shadow: `--shadow-md`
- Hover: shadow increases, border brightens (optional)

**Card Sections**:
- Header (optional): Bold title, subtitle, or compact info
- Body: Main content
- Footer (optional): Actions, timestamps, meta info

**Variants**:
1. **Job Card** (list view):
   - Title (large, bold)
   - Category badge
   - Budget range, deadline
   - Description preview
   - Posted date, proposal count
   - Hover effect: slight elevation, cursor = pointer

2. **Proposal Card**:
   - Dev avatar + name
   - Offered price (prominent)
   - Rating indicator
   - Status badge
   - Date submitted
   - Quick action buttons

3. **Contract Card**:
   - Job title, dev name, avatar
   - Amount, status badge
   - Payment status indicator
   - Due date
   - Quick actions

---

#### Tables

**Table Layout** (desktop view):
- Header: Bold text, `--neutral-dark` color
- Row padding: `12px 16px` per cell
- Striped rows (alternate `--white` and `--neutral-lighter`)
- Borders: subtle `--neutral-light` lines
- Hover row: slight background change
- Sort: indicator (arrow) on clickable headers
- Pagination: at bottom with page numbers, prev/next buttons

**Responsive Tables** (mobile view):
- Convert to card layout (one card per row)
- Stack columns vertically: label - value
- Swipe or tap for actions
- No horizontal scroll

---

#### Modals / Dialogs

**Modal Structure**:
- Background overlay: black, 50% opacity (z-index: modal-1)
- Modal box: white background, centered (z-index: modal)
- Header: Title + close button (X icon, top-right)
- Body: Content (padding all sides)
- Footer: Action buttons (usually aligned right)

**Styling**:
- Radius: `--radius-lg`
- Shadow: `--shadow-xl`
- Max-width: 90vw (mobile), 600px (desktop)
- Min-width: 300px

**Examples**:
- Confirmation modal: "Are you sure?" + action buttons
- Form modal: Input fields + submit button
- Detail modal: Read-only info + close button

---

#### Toast / Alerts

**Toast Messages**:
- Position: bottom-right (or top-right, depending on UX)
- Auto-dismiss: 4-5 seconds (or persistent for errors)
- Background: color-coded by type
  - Success: green (`--secondary`)
  - Error: red (`--danger`)
  - Warning: orange (`--warning`)
  - Info: blue (`--primary`)
- Text: white
- Icon + message text
- Optional: close button (X)
- Padding: `12px 16px`
- Radius: `--radius-md`

**Examples**:
- "Proposal sent successfully!"
- "Payment failed. Please try again."
- "Contract created. Waiting for payment..."

---

#### Navigation & Headers

**Top Navigation Bar**:
- Background: white (or light gray)
- Border-bottom: 1px solid `--neutral-light`
- Height: 60px (responsive)
- Left: Logo/brand name + nav links
- Center: (optional) App title or breadcrumb
- Right: User avatar + dropdown menu, notifications bell, logout

**Navigation Links**:
- Text color: `--primary` when active, `--neutral` when inactive
- Border-bottom: 2px solid `--primary` when active
- Hover: `--neutral-light` background
- Responsive: collapse to hamburger menu on mobile

**Sidebar Navigation** (optional, desktop):
- Width: 250px (collapsible to 60px)
- Background: `--neutral-dark` or `--neutral-lighter`
- Text: `--primary` when active, `--neutral` when inactive
- Icons: 20x20px next to text
- Hover: background highlight

---

#### Ratings & Stars

**Star Rating Display**:
- 5 stars, filled/empty/half
- Color: gold (#FBBF24) or `--primary`
- Size: 16px (display), 24px (interactive)
- Label: "4.5 (120 reviews)" next to stars

**Interactive Rating Selector**:
- 5 clickable stars
- Hover effect: highlight stars up to cursor
- Click to select rating
- Selected color: gold or `--primary`

---

#### Timeline / Progress

**Timeline Component**:
- Vertical line (left side)
- Nodes/circles at each milestone (colored by status)
- Labels & dates on right
- Colors: completed = green, current = blue, future = gray
- Connector lines between nodes

**Example**:
```
✓ Proposal submitted - Jan 15
✓ Proposal accepted - Jan 16
◉ Payment escrowed - Jan 17 (in progress)
○ Delivery submitted - (pending)
○ Payment released - (pending)
```

---

#### Empty States

**Empty State Component**:
- Icon (illustrative)
- Headline: "Không có [items]" (No items)
- Description: "Thử [action]" (Try action)
- CTA button: Link to create/browse items
- Example:
  - "Chưa có công việc nào"
  - "Hãy đăng công việc mới hoặc duyệt công việc"
  - Button: "Tạo Công Việc Mới"

---

#### Loading States

**Spinners**:
- Circular spinner: rotating circle
- Color: `--primary`
- Size: 24px, 32px, or 48px
- Placement: center of loading area

**Skeleton Loaders** (for content):
- Gray placeholder blocks (same size as content)
- Subtle animation (fade in-out)
- Multiple skeletons if multiple items

---

### 6.3 Component Map

**Shared Components** (used across multiple screens):
- Button (5 variants)
- Badge / Status Indicator
- Input (text, select, checkbox, radio, date, file)
- Card (generic, job, proposal, contract)
- Table (with sorting, pagination)
- Modal / Dialog
- Toast / Alert
- Header / Navigation
- Sidebar (optional)
- Rating / Stars
- Timeline
- Empty State
- Spinner / Loading

**Business-Specific Components**:
- JobCard
- ProposalCard
- ProposalList
- ContractCard
- ContractTimeline
- DeliveryReviewPanel
- PaymentForm
- StripeCheckout
- ProposalForm
- JobForm
- NotificationCenter
- NotificationItem
- ReviewForm
- ReviewCard
- DevProfileCard
- StatusBadge (with color logic)

**Layout Components**:
- AppLayout (with header + sidebar)
- DashboardGrid
- FormLayout
- ListLayout
- DetailLayout

---

## 7. API Mapping Table

| Feature | Screen | Action | HTTP Method | Endpoint | Key Request Fields | Key Response Fields | Status Code | Error Handling |
|---------|--------|--------|-------------|----------|-------------------|-------------------|---------------|------------------|
| **AUTH** | | | | | | | | |
| Sign Up | Register | Create account | POST | `/auth/register` | email, password, role (CLIENT/DEV) | user_id, token, role | 201 | Duplicate email (409), weak password (400) |
| Sign In | Login | Authenticate | POST | `/auth/login` | email, password | user_id, token, role, expires_at | 200 | Invalid credentials (401), account disabled (403) |
| Get Profile | All | Current user | GET | `/auth/me` | (headers: Authorization) | user_id, name, email, role, avatar_url | 200 | Unauthorized (401), token expired (401) |
| Logout | All | End session | POST | `/auth/logout` | (headers: Authorization) | success | 200 | Unauthorized (401) |
| | | | | | | | | |
| **JOBS (CLIENT)** | | | | | | | | |
| Create Job | Create Job Form | Post new job | POST | `/jobs` | title, description, budget_min, budget_max, deadline, category, skills[], attachments[] | job_id, status=OPEN, created_at | 201 | Validation (400), unauthorized (401) |
| List My Jobs | My Jobs List | View own jobs | GET | `/jobs?owner=me&status=OPEN,IN_PROGRESS,COMPLETED,CANCELLED&page=1&limit=20` | (query params) | jobs[], total_count, page | 200 | Unauthorized (401) |
| Job Detail | Job Detail | View 1 job | GET | `/jobs/:job_id` | (URL param) | job: {id, title, description, budget_min, budget_max, deadline, category, status, created_at, proposal_count, view_count} | 200 | Not found (404), unauthorized (401) |
| Close Job | Job Detail | Change status | PATCH | `/jobs/:job_id` | status=COMPLETED or CANCELLED | job: {id, status, updated_at} | 200 | Not found (404), conflict (409), unauthorized (401) |
| List Proposals | Proposal List | View proposals | GET | `/jobs/:job_id/proposals?status=PENDING,ACCEPTED,REJECTED,WITHDRAWN&page=1&limit=20` | (URL + query) | proposals[], total_count | 200 | Not found (404), forbidden (403) |
| | | | | | | | | |
| **JOBS (DEV)** | | | | | | | | |
| Browse Jobs | Jobs Feed | Discover jobs | GET | `/jobs?status=OPEN&category=[]&budget_min=&budget_max=&deadline=&sort=newest&page=1&limit=20` | (query params) | jobs[], total_count, page, filters (for UI) | 200 | Bad request (400) |
| Job Detail | Job Detail (DEV) | View job | GET | `/jobs/:job_id` | (URL param) | job: {...}, applied=true/false | 200 | Not found (404) |
| | | | | | | | | |
| **PROPOSALS (DEV)** | | | | | | | | |
| Create Proposal | Create Proposal Form | Apply for job | POST | `/proposals` | job_id, offered_price, message, attachments[] | proposal_id, status=PENDING, created_at | 201 | Validation (400), conflict=already_applied (409), not_found (404) |
| List My Proposals | My Proposals List | View own proposals | GET | `/proposals?status=PENDING,ACCEPTED,REJECTED,WITHDRAWN&page=1&limit=20` | (query params) | proposals[], total_count | 200 | Unauthorized (401) |
| Proposal Detail | Proposal Detail | View 1 proposal | GET | `/proposals/:proposal_id` | (URL param) | proposal: {id, job_id, job_title, offered_price, message, status, created_at, attachments} | 200 | Not found (404), forbidden (403) |
| Withdraw Proposal | Proposal Detail | Cancel pending proposal | PATCH | `/proposals/:proposal_id` | status=WITHDRAWN | proposal: {id, status, updated_at} | 200 | Not found (404), conflict (409), forbidden (403) |
| | | | | | | | | |
| **PROPOSALS (CLIENT)** | | | | | | | | |
| Accept Proposal | Proposal Detail | Approve proposal | PATCH | `/proposals/:proposal_id` | status=ACCEPTED | proposal: {id, status, accepted_at} | 200 | Not found (404), forbidden (403), conflict (409) |
| Reject Proposal | Proposal Detail | Decline proposal | PATCH | `/proposals/:proposal_id` | status=REJECTED, reason (optional) | proposal: {id, status, rejected_at} | 200 | Not found (404), forbidden (403), conflict (409) |
| Upload Attachment | Proposal Form | Add file to proposal | POST | `/proposals/:proposal_id/attachments` | file (multipart), filename | attachment: {id, url, filename, size, type} | 201 | Validation (400), file too large (413), not found (404) |
| Delete Attachment | Proposal Form | Remove file | DELETE | `/proposals/:proposal_id/attachments/:attachment_id` | (URL params) | success | 200 | Not found (404), forbidden (403) |
| List Attachments | Proposal Form | View proposal files | GET | `/proposals/:proposal_id/attachments` | (URL param) | attachments[] | 200 | Not found (404) |
| | | | | | | | | |
| **CONTRACTS** | | | | | | | | |
| Create Contract | Proposal Accepted | Create from proposal | POST | `/contracts` | proposal_id | contract: {id, job_id, proposal_id, dev_id, client_id, status=ACTIVE, created_at, amount} | 201 | Not found (404), conflict (409), forbidden (403) |
| List My Contracts | Contracts List | View own contracts | GET | `/contracts?status=ACTIVE,COMPLETED,DISPUTED,CANCELLED&page=1&limit=20` | (query params) | contracts[], total_count | 200 | Unauthorized (401) |
| Contract Detail | Contract Detail | View 1 contract | GET | `/contracts/:contract_id` | (URL param) | contract: {id, job_id, job_title, dev_id, dev_name, client_id, client_name, amount, status, created_at, due_date, payment_status, delivery_status, timeline[]} | 200 | Not found (404), forbidden (403) |
| Submit Delivery | Submit Delivery | Upload deliverables | POST | `/contracts/:contract_id/delivery` | message, delivery_files[] | delivery: {id, contract_id, status=SUBMITTED, submitted_at} | 201 | Validation (400), not found (404), conflict (409), forbidden (403) |
| Review Delivery | Delivery Review | Accept/Dispute | PATCH | `/contracts/:contract_id/delivery` | status=ACCEPTED or DISPUTED, dispute_reason (if disputed) | delivery: {id, status, reviewed_at, client_review} | 200 | Not found (404), conflict (409), forbidden (403) |
| | | | | | | | | |
| **PAYMENTS** | | | | | | | | |
| Create Payment | Create Payment Form | Initiate payment | POST | `/payments` | contract_id, amount | payment: {id, contract_id, amount, status=PENDING, created_at, stripe_intent_id} | 201 | Validation (400), not found (404), conflict (409), forbidden (403) |
| Stripe Checkout | Stripe Page | Process payment | POST | `/payments/:payment_id/checkout` | (headers) | checkout: {session_id, url} | 200 | Not found (404), bad request (400) |
| Release Payment | Contract Detail | Transfer to dev | PATCH | `/payments/:payment_id` | status=RELEASED | payment: {id, status=RELEASED, released_at, transaction_id} | 200 | Not found (404), conflict (409), forbidden (403) |
| Payment Logs | Payment History | View timeline | GET | `/payments/:payment_id/logs?page=1&limit=50` | (URL + query) | logs[] (all events: created, charged, escrowed, disputed, refunded, released) | 200 | Not found (404), forbidden (403) |
| Stripe Webhook | Backend | Handle events | POST | `/webhooks/stripe` | stripe_event (payload) | success | 200 | Invalid signature (401), bad request (400) |
| | | | | | | | | |
| **REVIEWS** | | | | | | | | |
| Create Review | Leave Review Form | Rate & comment | POST | `/reviews` | contract_id, rating (1-5), comment | review: {id, contract_id, author_id, rating, comment, created_at} | 201 | Validation (400), not found (404), conflict (409), forbidden (403) |
| Get Reviews by Dev | DEV Profile | View all reviews | GET | `/devs/:dev_id/reviews?page=1&limit=20` | (URL + query) | reviews[], avg_rating, total_count | 200 | Not found (404) |
| Get Review by Contract | Contract Detail | View review | GET | `/contracts/:contract_id/review` | (URL param) | review: {id, rating, comment, created_at, author: {name, avatar}} | 200 | Not found (404) (review may not exist) |
| Get My Reviews | Reviews Page | View own reviews | GET | `/reviews?author=me&page=1&limit=20` | (query) | reviews[], total_count | 200 | Unauthorized (401) |
| | | | | | | | | |
| **NOTIFICATIONS** | | | | | | | | |
| List Notifications | Notifications Center | View all | GET | `/notifications?status=all,unread&page=1&limit=20` | (query) | notifications[], total_count, unread_count | 200 | Unauthorized (401) |
| Mark as Read | Notifications Center | Read notification | PATCH | `/notifications/:notification_id` | is_read=true | notification: {id, is_read, read_at} | 200 | Not found (404), forbidden (403) |
| Mark All as Read | Notifications Center | Read all | PATCH | `/notifications/bulk` | action=mark_all_read | success, updated_count | 200 | Unauthorized (401) |

---

## 8. Edge Cases & State Handling

### 8.1 Error Scenarios

#### 1. Authorization & Authentication
- **Unauthorized (401)**:
  - User not logged in or token expired
  - Action: Redirect to login page, show "Phiên làm việc hết hạn. Vui lòng đăng nhập lại." (Session expired. Please log in again.)

- **Forbidden (403)**:
  - User role doesn't match required role
  - Action: Show "Bạn không có quyền thực hiện hành động này." (You don't have permission to do this.)
  - Example: DEV cannot create jobs, CLIENT cannot submit deliveries

- **Conflict due to Role**:
  - CLIENT trying to apply for job (should DEV only)
  - Action: Show "Tính năng này chỉ dành cho [role]." (This feature is for [role] only.)

#### 2. Status Conflicts
- **Invalid State Transition**:
  - Trying to accept already-accepted proposal
  - Trying to submit delivery twice
  - Action: Prevent action (disable button), show tooltip "Không thể thực hiện hành động này trong trạng thái hiện tại." (Cannot perform this action in the current state.)

- **Job Closed**:
  - Trying to apply for closed job
  - Trying to create proposal for IN_PROGRESS job
  - Action: Show toast "Công việc này đã đóng." (This job is closed.)

- **Payment Already Processed**:
  - Webhook received second time (idempotency check)
  - Action: Log, but don't process twice. Return 200 OK to Stripe.

#### 3. Payment Failures
- **Stripe Checkout Failed**:
  - User cancels checkout, card declined, expired
  - Action: Show error message from Stripe, provide retry button
  - Message: "Thanh toán thất bại. Vui lòng thử lại." (Payment failed. Please try again.)

- **Insufficient Funds**:
  - Payment amount exceeds available balance
  - Action: Show "Số dư không đủ." (Insufficient funds.) Suggest topup or reduce amount.

- **Webhook Timeout**:
  - Stripe webhook not received within 24 hours
  - Action: Backend polling (Phase 2): Periodically check payment status via Stripe API
  - User notification: "Đơn thanh toán đang được xử lý. Vui lòng quay lại sau." (Payment is being processed. Please come back later.)

#### 4. Data Inconsistencies
- **Stale Data** (user sees old status):
  - Client refreshes, sees old job status
  - Action: Implement real-time notifications via WebSocket or polling
  - Fallback: Show "Dữ liệu có thể đã thay đổi. Nhấn để tải lại." (Data may have changed. Click to reload.)

- **Missing Records**:
  - User tries to access deleted contract
  - Action: Show "Hợp đồng không tìm thấy." (Contract not found.) + navigation back

- **Concurrent Edits** (Phase 2):
  - Two users trying to accept same proposal
  - Action: First one wins, second gets error. Refresh list.

#### 5. Delivery & Review Scenarios
- **Delivery Dispute Open**:
  - Trying to accept delivery after dispute filed
  - Action: Disable buttons, show "Hợp đồng đang tranh chấp. Vui lòng chờ hỗ trợ." (Contract is disputed. Please wait for support.)

- **Late Delivery**:
  - DEV submits after deadline (Phase 2)
  - Action: Flag in UI "Giao muộn" (Late delivery), but still allow acceptance

- **Review Deleted** (Phase 2):
  - Reviewer tries to modify after submission period
  - Action: Show "Bạn không thể sửa đánh giá này." (You can't modify this review.)

---

### 8.2 Edge Cases by Feature

#### Job Management
| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| Job budget is 0 | Reject on create | "Ngân sách phải lớn hơn 0." (Budget must be > 0) |
| Deadline is past | Reject on create | "Hạn chót phải là ngày trong tương lai." (Deadline must be future) |
| DEV applies to own job | Prevent (check owner) | "Bạn không thể ứng tuyển công việc của mình." (Can't apply to your own job) |
| Job has 0 proposals | Show "Chưa có proposal nào." (No proposals yet) | Empty state on proposals panel |
| Try to close completed job | Disable button, show tooltip | "Công việc đã hoàn thành." (Job is completed) |

#### Proposal Management
| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| Offered price > job budget | Warning (not error) | "Giá đề xuất cao hơn ngân sách công việc." (Offered price exceeds job budget) |
| DEV applies twice to same job | Reject, show existing proposal | "Bạn đã gửi proposal cho công việc này. Xem chi tiết?" (You already applied) |
| Try to withdraw accepted proposal | Disable, show tooltip | "Không thể rút proposal đã được chấp nhận." (Can't withdraw accepted proposal) |
| Proposal message too short | Validation error | "Mô tả phải có ít nhất 100 ký tự." (Min 100 chars) |
| Accept proposal with invalid contract state | Check contract doesn't exist | "Hợp đồng không tìm thấy. Vui lòng thử lại." (Contract not found) |

#### Delivery & Review
| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| DEV submits empty files | Reject | "Vui lòng tải lên ít nhất 1 tập tin." (Upload at least 1 file) |
| File size too large (> 50MB) | Reject | "Tập tin quá lớn. Giới hạn: 50MB." (File too large. Limit: 50MB) |
| CLIENT disputes then accepts | Last action wins | "Tranh chấp đã được hủy. Bài giao đã được chấp nhận." (Dispute cancelled. Delivery accepted) |
| Review submitted without rating | Reject | "Vui lòng chọn đánh giá." (Please select a rating) |
| DEV can't write review on own work | Prevent | "Bạn không thể đánh giá chính mình." (Can't review yourself) |
| Time window to review passed (30 days) | Disable review form | "Thời hạn để đánh giá đã hết." (Review deadline passed) |

#### Payment & Stripe
| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| Try to pay for already-paid contract | Disable button | "Thanh toán đã được xử lý cho hợp đồng này." (Payment already processed) |
| Stripe session expires | Show retry button | "Phiên thanh toán đã hết hạn. Vui lòng thử lại." (Checkout session expired) |
| DEV tries to release own payment | Prevent (role check) | "Chỉ CLIENT có thể phát hành thanh toán." (Only client can release) |
| Webhook receives duplicate event (idempotent_key) | Log but don't reprocess | (Silent, no user-facing message) |
| Payment refunded | Update payment status, notify user | "Thanh toán của bạn đã được hoàn trả." (Payment refunded) |
| Try to release disputed payment | Disable | "Thanh toán đang tranh chấp. Vui lòng chờ." (Payment is disputed) |

#### Notifications
| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| No new notifications | Show "Không có thông báo mới." (No new notifications) | Empty state |
| Notification for deleted contract | Show but link broken | "Hợp đồng không tìm thấy." (Contract not found) when clicked |
| Mark notification as read (already read) | Idempotent (200 OK) | (No change on UI) |

---

### 8.3 Network & Performance Edge Cases

| Scenario | Expected Behavior | UI/Message |
|----------|-------------------|-----------|
| Slow network, request takes > 10s | Show timeout error | "Yêu cầu quá lâu. Vui lòng thử lại." (Request timeout) |
| User offline | Show offline indicator | "Bạn đang ngoại tuyến." (You're offline) |
| Backend returns 500 error | Show generic error | "Lỗi máy chủ. Vui lòng thử lại sau." (Server error. Try again later) |
| Rate limited (429) | Show retry-after | "Quá nhiều yêu cầu. Vui lòng chờ [n] giây." (Too many requests. Wait [n] seconds) |

---

### 8.4 Empty & Null States

| Screen | Empty State | Action |
|--------|-----------|--------|
| Jobs Feed (DEV) | "Không tìm thấy công việc phù hợp." (No matching jobs) | "Thay đổi bộ lọc" (Change filter) button |
| My Proposals | "Chưa gửi proposal nào." (No proposals yet) | "Duyệt công việc" (Browse jobs) button |
| Contracts (no active) | "Không có hợp đồng đang hoạt động." (No active contracts) | "Tạo công việc" (Create job, for CLIENT) or "Duyệt công việc" (Browse jobs, for DEV) |
| Notifications | "Không có thông báo nào." (No notifications) | Refresh or back to dashboard |
| Deliveries (no submitted) | "Chưa gửi bài giao nào." (No deliveries) | "Gửi bài giao" (Submit delivery) button |
| Reviews (no received) | "Chưa nhận được đánh giá nào." (No reviews yet) | "Hoàn thành hợp đồng" (Complete contracts) tip |

---

### 8.5 Permission Matrix

| Action | CLIENT | DEV | Notes |
|--------|--------|-----|-------|
| Create Job | ✓ | ✗ | Only CLIENT |
| Browse Jobs | ✗ | ✓ | Only DEV |
| Apply for Job (create proposal) | ✗ | ✓ | Only DEV, one per job |
| Accept/Reject Proposal | ✓ | ✗ | Only job creator (CLIENT) |
| Withdraw Proposal | ✗ | ✓ | Only proposal author (DEV), if PENDING |
| Create Contract | ✓ | ✗ | From accepted proposal |
| Submit Delivery | ✗ | ✓ | Only contract dev (DEV) |
| Review Delivery | ✓ | ✗ | Only contract client (CLIENT) |
| Release Payment | ✓ | ✗ | Only contract client (CLIENT) |
| Create Review | ✓ | ✗ | After payment RELEASED, only client can review dev |
| View Notifications | ✓ | ✓ | Role-specific notifications |

---

## 9. Frontend Implementation Roadmap

### Phase 1: Core Job & Proposal Flow (Weeks 1-3)

**Objective**: Build job posting, proposal submission, and contract creation with basic payment setup

**Features**:
1. Authentication & User Onboarding
   - Sign up/login (email, password, role selection)
   - Session management, logout
   - Auth guards on routes
   - **Deliverable**: Login/register pages + protected routes

2. CLIENT - Job Management
   - Create job form (title, description, budget, deadline)
   - My jobs list (filter by status, search)
   - Job detail page
   - Close/archive job
   - **Deliverable**: Job creation and browsing (CLIENT side)

3. DEV - Job Browsing & Proposals
   - Jobs feed/list with filters (budget, category, deadline)
   - Job detail view
   - Create proposal form (price + message + attachments)
   - My proposals list (with status)
   - Proposal detail
   - Withdraw proposal
   - **Deliverable**: Job browsing and proposal submission (DEV side)

4. CLIENT - Proposal Management
   - View proposals for a job
   - Accept/reject proposal
   - **Deliverable**: Proposal acceptance workflow

5. Contract Creation
   - Create contract from accepted proposal
   - Contract list (CLIENT & DEV)
   - Contract detail view
   - Contract status tracking
   - **Deliverable**: Contract management setup

**Tech Stack**:
- Frontend: Next.js 16, React, TypeScript
- UI Components: shadcn/ui
- State Management: SWR or Zustand (simple client state)
- Styling: Tailwind CSS
- Database integration: Connect to backend API (mock if necessary)

**Success Criteria**:
- [ ] User can register, login with role
- [ ] CLIENT can create and list jobs
- [ ] DEV can browse jobs and submit proposals
- [ ] CLIENT can view and accept proposals
- [ ] Contracts auto-create from accepted proposals
- [ ] All screens render without errors
- [ ] Basic validation works
- [ ] Responsive on mobile & desktop

**Deliverables**: 15-18 screens functional

---

### Phase 2: Payment & Delivery System (Weeks 4-6)

**Objective**: Implement escrow payment via Stripe and delivery submission/review

**Features**:
1. Payment Flow
   - Create payment form (amount entry, validation)
   - Stripe checkout integration
   - Payment status tracking (PENDING → ESCROWED → RELEASED)
   - Payment logs/history
   - Webhook handling (offline for now, test with test mode)
   - **Deliverable**: Full payment flow

2. Delivery Management
   - DEV: Submit delivery form (message + file upload)
   - CLIENT: Review delivery interface
   - Accept delivery (marks as ACCEPTED, enables release payment)
   - Dispute delivery (form + reason)
   - Delivery status tracking
   - **Deliverable**: Delivery submission and review workflow

3. Payment Release
   - CLIENT: Release payment button (after delivery accepted)
   - Payment released notification
   - Contract completion
   - **Deliverable**: Payment release to dev

4. Reviews System
   - CLIENT: Leave review form (after payment released)
   - DEV: View received reviews
   - DEV: Profile with ratings
   - Average rating calculation
   - **Deliverable**: Review functionality

**Tech Stack** (additions):
- Stripe SDK (@stripe/react-stripe-js)
- File upload library (dropzone, react-dropzone)
- API integration (axios or fetch with SWR)

**Success Criteria**:
- [ ] CLIENT can create and complete Stripe checkout
- [ ] Payment status updates correctly
- [ ] Webhook test events process correctly
- [ ] DEV can submit deliverables with files
- [ ] CLIENT can accept/dispute deliveries
- [ ] CLIENT can release payment to DEV
- [ ] Reviews can be created and viewed
- [ ] DEV profile shows ratings

**Deliverables**: +8-10 screens (payment, delivery, review related)

---

### Phase 3: Notifications, Polish & Optimization (Weeks 7-8)

**Objective**: Add real-time notifications, polish UI, optimize performance, and fix edge cases

**Features**:
1. Notifications System
   - Notification center (list all notifications)
   - Mark as read / mark all as read
   - Notification types (proposal, contract, payment, review, dispute)
   - Bell icon with unread count
   - Toast notifications for real-time events
   - **Deliverable**: Full notifications hub

2. UI Polish
   - Refine design details (spacing, colors, typography)
   - Improve loading states (spinners, skeleton loaders)
   - Improve error states (validation, network errors)
   - Empty states for all list views
   - Improve button/form interactions
   - **Deliverable**: Polished UI/UX

3. Edge Case Handling
   - Permission checks (who can do what)
   - Status validation (can't act on invalid states)
   - Error messages in Vietnamese (all)
   - Accessibility (ARIA labels, keyboard navigation)
   - Form validation (min/max, required fields)
   - **Deliverable**: Robust error handling

4. Performance & Optimization
   - Image optimization (avatars, thumbnails)
   - Code splitting (lazy load routes)
   - Caching strategy (SWR with revalidation)
   - Database query optimization (on backend)
   - **Deliverable**: Fast, optimized app

5. Mobile Optimization
   - Responsive design refinement
   - Touch-friendly buttons/inputs
   - Mobile navigation (hamburger menu)
   - Bottom sheet modals (if needed)
   - **Deliverable**: Mobile-first experience

6. Testing & QA (Light)
   - Manual testing on multiple devices
   - Browser compatibility check
   - Accessibility audit (basic)
   - Test all user flows end-to-end
   - **Deliverable**: Bug fixes, stable build

**Tech Stack** (additions):
- WebSocket for real-time notifications (Phase 2, if live updates needed)
- Image optimization (next/image)
- Testing: Jest + React Testing Library (optional, Phase 4)

**Success Criteria**:
- [ ] All notifications display correctly
- [ ] UI matches design spec
- [ ] All error cases handled with messages
- [ ] App works smoothly on mobile
- [ ] Page load time < 3s (target)
- [ ] No console errors
- [ ] All accessibility requirements met

**Deliverables**: Polish pass on all ~30 screens, notifications added, optimization complete

---

### Post-Phase 3 (Future, Phase 4+)

1. **Admin Dashboard** (if needed):
   - Dispute resolution interface
   - User management
   - Payment monitoring
   - Content moderation

2. **Enhanced Features**:
   - Real-time chat between CLIENT & DEV
   - Milestone-based contracts (phases)
   - Revisions/rework tracking
   - Escrow hold periods (configurable)
   - Rating appeals
   - Dev portfolio section
   - Saved jobs / favorites
   - Advanced search & recommendations
   - Two-factor authentication
   - Payment dispute resolution portal

3. **Analytics & Reporting**:
   - User dashboards (stats, earnings, spending)
   - Transaction reports
   - Performance metrics

---

## 10. Implementation Checklist

### Phase 1 Checklist
- [ ] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] API client setup (axios/fetch wrappers)
- [ ] Auth flows (sign up, login, logout, session)
- [ ] Auth guards + protected routes
- [ ] Design tokens & color system
- [ ] Button, input, badge components
- [ ] CLIENT Dashboard screen
- [ ] Create Job form + validation
- [ ] My Jobs list + filters
- [ ] Job detail (CLIENT view)
- [ ] DEV Dashboard screen
- [ ] Jobs feed + filters (DEV view)
- [ ] Job detail (DEV view)
- [ ] Create Proposal form + file upload
- [ ] My Proposals list
- [ ] Proposal detail (DEV view)
- [ ] Proposal detail + Accept/Reject (CLIENT view)
- [ ] Contract creation from proposal
- [ ] Contracts list (CLIENT & DEV)
- [ ] Contract detail (CLIENT & DEV)
- [ ] Error handling & validation
- [ ] Responsive design checks
- [ ] Deploy to staging

### Phase 2 Checklist
- [ ] Stripe SDK setup
- [ ] Create Payment form
- [ ] Stripe Checkout integration
- [ ] Payment status tracking
- [ ] Webhook setup (test mode)
- [ ] Payment logs/history screen
- [ ] Submit Delivery form + file upload
- [ ] Delivery Review interface
- [ ] Accept/Dispute Delivery logic
- [ ] Release Payment button & flow
- [ ] Delivery timeline updates
- [ ] Leave Review form
- [ ] View Reviews (DEV profile)
- [ ] Review rating calculation
- [ ] Error handling for payment failures
- [ ] Stripe test scenarios (success, failure, refund)
- [ ] Deploy to staging

### Phase 3 Checklist
- [ ] Notification Center screen
- [ ] Notification types setup
- [ ] Mark as read / bulk actions
- [ ] Toast notifications
- [ ] Bell icon with unread count
- [ ] Loading states (spinners, skeleton)
- [ ] Empty states (all lists)
- [ ] Error state messages (Vietnamese)
- [ ] Form validation messages
- [ ] Permission checks on all screens
- [ ] Status validation (can't action on invalid states)
- [ ] Accessibility audit (color contrast, ARIA labels, keyboard nav)
- [ ] Mobile responsive refinement
- [ ] Image optimization
- [ ] Performance testing
- [ ] Browser compatibility testing
- [ ] End-to-end user flow testing
- [ ] QA bug fixes
- [ ] Final deploy to production

---

## 11. Assumptions & Notes

### Technical Assumptions
1. Backend API is already implemented and available at `baseURL` (to be provided)
2. Stripe is configured in backend with webhook endpoint
3. Database schema follows the domain entities (Jobs, Proposals, Contracts, Payments, Reviews, Notifications)
4. User authentication uses JWT tokens (stored in httpOnly cookies for security)
5. File uploads go through backend (not direct to S3, for simplicity)
6. No real-time WebSocket needed in Phase 1-3 (polling via SWR is sufficient)
7. Emails are handled by backend (user doesn't need to implement)

### Design Assumptions
1. UI language is Vietnamese throughout
2. Currency is VND (or USD, to be specified)
3. Date format: DD/MM/YYYY
4. Time zone: Vietnam Standard Time (or project-specified)
5. Mobile breakpoint: < 768px (md in Tailwind)
6. Desktop breakpoint: ≥ 768px
7. Color palette follows Apple/modern design (blue primary, green success, red danger)
8. No custom animations (keep it professional, not trendy)

### Business Logic Assumptions
1. One proposal per DEV per job (can be withdrawn and resubmitted)
2. One contract per accepted proposal (cannot accept multiple proposals for same job)
3. Payment must be escrowed before delivery can be submitted
4. Delivery can be disputed, which pauses payment release
5. Reviews can only be created after payment is released
6. Contract becomes COMPLETED after payment released (or after 30 days if disputed)
7. DEV cannot review own work (system should prevent)
8. Ratings are used for DEV credibility (used in future for recommendations)
9. All notifications are event-driven (not scheduled)

---

## 12. File Structure Recommendation

```
devboard-app/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Global styles + design tokens
│   ├── page.tsx                     # Landing page (redirect to dashboard)
│   ├── (auth)/
│   │   ├── sign-up/page.tsx
│   │   └── sign-in/page.tsx
│   ├── (client)/
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/
│   │   │   ├── create/page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── [jobId]/page.tsx
│   │   │   └── [jobId]/proposals/page.tsx
│   │   ├── contracts/
│   │   │   ├── page.tsx
│   │   │   └── [contractId]/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── reviews/page.tsx
│   │   └── notifications/page.tsx
│   ├── (dev)/
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx
│   │   │   ├── [jobId]/page.tsx
│   │   │   └── [jobId]/apply/page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx
│   │   │   └── [proposalId]/page.tsx
│   │   ├── contracts/
│   │   │   ├── page.tsx
│   │   │   └── [contractId]/page.tsx
│   │   ├── reviews/page.tsx
│   │   └── notifications/page.tsx
│   ├── settings/
│   │   ├── profile/page.tsx
│   │   └── account/page.tsx
│   └── api/                         # API routes if needed
│       └── ...
├── components/
│   ├── ui/                          # shadcn components (pre-built)
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   ├── NotificationBell.tsx
│   │   └── ...
│   ├── business/
│   │   ├── JobCard.tsx
│   │   ├── ProposalCard.tsx
│   │   ├── ContractCard.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── DeliveryReviewPanel.tsx
│   │   └── ...
│   └── forms/
│       ├── JobForm.tsx
│       ├── ProposalForm.tsx
│       └── ...
├── hooks/
│   ├── useAuth.ts                   # Auth context/hook
│   ├── useUser.ts
│   ├── useFetch.ts                  # SWR wrapper
│   ├── useLocalStorage.ts
│   └── ...
├── lib/
│   ├── api.ts                       # API client setup
│   ├── utils.ts                     # Utility functions
│   ├── validation.ts                # Form validation schemas
│   ├── constants.ts                 # App constants (statuses, colors, etc.)
│   └── ...
├── types/
│   ├── index.ts                     # Shared types
│   ├── api.ts                       # API request/response types
│   ├── domain.ts                    # Business domain types (Job, Proposal, etc.)
│   └── ...
├── context/
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── ...
├── styles/
│   ├── variables.css                # CSS custom properties (if not in globals.css)
│   └── ...
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
├── tailwind.config.ts               # Tailwind config with design tokens
├── tsconfig.json
├── package.json
└── README.md
```

---

## Conclusion

This comprehensive design specification provides a complete blueprint for building the DevBoard platform. The phased implementation roadmap prioritizes core features (job + proposal flow) before adding payment and polish, ensuring rapid iteration and early user feedback.

**Key Takeaways**:
- **3-phase rollout**: Core → Payment/Delivery → Notifications/Polish
- **~30 unique screens** across CLIENT and DEV roles
- **Clear API mapping**: Every screen action tied to specific endpoints
- **Edge case handling**: Comprehensive error scenarios and state validation
- **Design system**: Consistent colors, typography, components, and tokens
- **Vietnamese UI**: All text, messages, and validation in Vietnamese
- **Accessibility & Mobile First**: WCAG AA compliance, responsive design

Teams should use this spec as a reference during development, updating as needed based on backend API changes or business requirement adjustments.

