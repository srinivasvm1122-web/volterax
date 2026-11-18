# VOLTERAX — Power Beyond Limits

> Electronics · Robotics · Automation · Connected Machines · Karnataka / India

Live Website: **[https://volterax-platform.onrender.com](https://volterax-platform.onrender.com)**

---

## ⚡ Overview

VOLTERAX turns electronics, embedded intelligence, and mechanical systems into working technology — from first circuit to real prototype.

This repository powers the live deployed website and full customer platform at **https://volterax-platform.onrender.com**.

---

## 🚀 Key Features

1. **Hardware-First Showcase**:
   - The Stack (Embedded Systems, Robotics, Connected Machines)
   - Real Systems Build Showcase
   - Engineering Loop (Idea → Circuit → Machine)
   - Born in Karnataka / India Origin Section

2. **📦 Projects Store (`/projects.html`)**:
   - 30 curated hardware engineering project concepts across Robotics, IoT, Agri-Tech, Safety, Renewable Energy, and Custom Embedded Systems.
   - 1-click "ORDER NOW" button routing directly into the customer portal.

3. **🔐 Customer Account Hub**:
   - Server-backed customer registration & login (scrypt password hashing + salted session cookies).
   - Commission a Build: Submit project title, estimated budget (₹ INR), and technical requirements.
   - Refer & Earn System: Unique referral codes, tracked referrals, and verified earnings dashboard.
   - Profile Management: Full name and email address updates.

4. **📝 Customer Feedback & Lead Capture**:
   - Direct feedback submission (stored in database).
   - Project brief submission (auto-syncs to WhatsApp).
   - Mobile contact unlock for direct engineering communication.

5. **🛡️ Owner Admin Dashboard (`/admin`)**:
   - Real-time KPI statistics: Customer count, Order count, Feedback count, Leads count, and Revenue.
   - Order management: Update order status (`pending`, `confirmed`, `processing`, `completed`, `cancelled`).
   - Feedback & Lead auditing.
   - Quarantined Atlas records viewer (legacy preservation).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Pure HTML5, CSS3 (cinematic responsive styling), Vanilla JavaScript (ES6+).
- **Backend**: Node.js (`server.js`) with native HTTP server.
- **Database**: MongoDB Atlas (`volterax_store` collection).
- **Hosting / Deployment**: Render Web Service (`volterax-platform.onrender.com`).

---

## 🏃 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/srinivasvm1122-web/volterax.git
   cd volterax
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=volterax
   ADMIN_EMAIL=admin@volterax.in
   ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   - Customer Portal: `http://localhost:3000/`
   - Projects Store: `http://localhost:3000/projects.html`
   - Admin Dashboard: `http://localhost:3000/admin`

---

## 📄 License
© VOLTERAX. All rights reserved.
