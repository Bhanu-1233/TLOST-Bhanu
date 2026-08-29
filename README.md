# Trainee Longitudinal Outcome Tracking System (MERN Stack MVP)

A privacy-conscious, low-burden web platform built on the **MERN stack** (MongoDB, Express, React, Node.js) following the complete specifications of the **Trainee Longitudinal Outcome Tracking System MVP Development Document**.

---

## 🌟 Overview & Real-World Purpose

Training providers measure course completion and initial placement, but frequently lose touch with trainees over time. This system solves that problem by:
- Creating a **consent-based longitudinal trainee record**.
- Tracking the trainee journey through **30-, 90-, and 180-day micro-survey checkpoints**.
- Preserving **historical wage band and employment progression snapshots** (Section 14 Data Model Rule).
- Allowing employers to validate employment details with **time-limited, privacy-preserving validation tokens** (`/validation/:token`).
- Capturing **structured skill gaps** and converting them into **Section 22 Actionable Rule Recommendations** for curriculum improvement.

---

## 👥 Role-Based Architecture & Dedicated Portals

Every user role has a dedicated portal and tailored interface:

| Role | Interface Route | Core Capabilities |
| :--- | :--- | :--- |
| **🎓 Trainee** | `/trainee` | • View training record & cohort details<br>• Manage Privacy Consent (v1.0 active/withdrawn)<br>• Submit 30/90/180-day micro-surveys with smart conditional questions<br>• Report new employment outcomes and wage-band progression<br>• Explore full longitudinal journey timeline |
| **🏢 Training Provider** | `/provider` | • Programs and Cohorts CRUD with skill areas & durations<br>• Trainee registry with search & filter by program/cohort/outcome<br>• Mark training completion & auto-schedule follow-ups<br>• View complete Trainee Longitudinal Timelines<br>• Generate secure time-limited Employer Validation Links (`/validation/:token`)<br>• Monitor follow-up survey queue |
| **💼 Employer** | `/employer` | • Public/Direct Token Validation Form (`/validation/:token`) for friction-free verification<br>• Dedicated Employer Dashboard for alumni overview<br>• Confirm/Reject job role, start date, and wage band<br>• Submit structured skill gap assessments across 6 core taxonomies |
| **🛡️ System Admin** | `/admin` | • System-wide KPI dashboard (Completion, Placement, Retention, Validation rate)<br>• Recharts interactive visual analytics (Outcome distribution, Wage progression, Skill gaps)<br>• **Section 22 Actionable Rule Engine** alerts with priority tags & remediation guidance<br>• Full User & Role (RBAC) Management<br>• System Security & Consent Audit Trail<br>• 1-Click Synthetic Demo Data Reseeder & Controlled CSV Outcome Export |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router Dom.
- **API Client**: **Axios** with centralized interceptors, automatic JWT injection, and error handling (`client/src/services/api.js`).
- **Backend**: Node.js, Express.js (REST API, modular monolith architecture).
- **Database & ODM**: MongoDB / Mongoose with automated in-memory MongoDB fallback (`mongodb-memory-server`) for zero-configuration startup.
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control (RBAC) middleware, and SHA-256 token hashing for validation requests.

---

## 🚀 Quick Start Guide

### 1. Installation

```bash
# Clone or navigate to the project directory
cd trainee-outcome-tracking

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Running the Application

In separate terminal tabs:

```bash
# Start Backend Server (runs on http://localhost:5000)
cd server
node server.js

# Start Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

The database automatically initializes and pre-seeds realistic synthetic demonstration data on first startup!

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Switcher** in the navigation bar or log in with the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `password123` |
| **Training Provider** | `provider@example.com` | `password123` |
| **Employer** | `employer@example.com` | `password123` |
| **Trainee** | `trainee@example.com` | `password123` |

Or use the **Role-Based Signup** page (`/signup`) powered by **Axios** to register a new account under any role.

---

## 📊 Section 22 Actionable Analytics Rules Engine

The platform automatically evaluates outcome and skill-gap metrics against predefined benchmarks:

1. **Communication Gap > 25%**: *Alert: Review and introduce dedicated workplace communication and presentation modules in upcoming cohorts.*
2. **3-Month Retention < 75%**: *Critical Alert: Conduct early 45-day check-in calls with newly placed trainees to identify early employer-trainee misalignment.*
3. **Employer Validation Rate < 60%**: *Notice: Streamline the one-click employer verification form and send automated 3-day reminder notifications.*
4. **Apprenticeship Conversion < 50%**: *Warning: Partner with host employers to formalize post-apprenticeship full-time hiring agreements.*

---

## 🛡️ Privacy-by-Design Compliance

- **Consent Versioning**: Stores timestamped grant and withdrawal events with audit logs.
- **Wage Bands**: Uses standardized brackets (`< $25k`, `$25k-$40k`, `$40k-$60k`, `$60k-$80k`, `$80k-$100k`, `$100k+`) to preserve confidentiality.
- **Minimal Validation Scope**: Employers only view candidate name, program, and reported role.
