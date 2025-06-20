# 📝 Feedback System

A lightweight, modern feedback platform for managers and employees to streamline performance reviews, deliver structured feedback, and drive professional growth.

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm**

### 1. Clone the Repository

```bash
git clone https://github.com/codingdud/feedback-system.git
cd feedback-system
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

- Copy the example environment file and update settings as needed:

```bash
cp .env.example .env
# Edit .env and fill in the required variables (database URL, secrets, etc.)
```

### 4. Run the Application

#### Development

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to access the app.

---

## 🏗️ Stack & Design Decisions

### **Tech Stack**

- **Frontend:** [Next.js](https://nextjs.org/) (React) with [TypeScript](https://www.typescriptlang.org/)
- **UI:** Tailwind CSS, Radix UI, Lucide React Icons
- **State:** React hooks and context
- **Backend API:** Modular service layer (see `services/api.ts`)
- **Styles:** Custom themes via `globals.css`
- **Containerization:** Docker-friendly setup

### **Architecture & Design Rationale**

- **Component-Based:** UI is organized into functional, reusable components for feedback lists, forms, management dashboards, and more.
- **Type Safety:** All major types and interfaces are strictly defined in TypeScript (e.g., `FeedbackWithDetails`, `User`).
- **Modern UI/UX:** Uses Tailwind CSS for utility-first styling and Radix UI for accessible primitives.
- **State Handling:** Uses React state and hooks for managing form state, loading, and error handling.
- **Manager & Employee Modes:** Role-based rendering and logic (`isManager` prop) to ensure tailored experiences.
- **API Layer:** All data operations abstracted into services (in `services/api.ts`), making it easy to swap out or extend the backend.
- **Theme & Accessibility:** Custom color palettes and dark mode support via CSS variables and Tailwind.
- **Validation:** Client-side validation for feedback forms (e.g., required fields, minimum character limits).
- **Extensibility:** Modular sidebar, breadcrumb, and UI primitives enable future expansion.
- **Production-Ready:** Docker support and environment variable configuration for seamless deployment.

---

## 📂 Project Structure

```
/
├── app/                # Application entry, layouts, and global styles
├── components/         # All React components (feedback, dashboard, UI primitives, etc.)
├── services/           # API/service layer
├── styles/             # CSS (globals, themes)
├── public/             # Static assets
├── .env.example        # Example environment configuration
├── docker-compose.yml  # Docker setup
└── README.md           # This file
```

---

## 💡 Notes

- Make sure to configure your environment variables before running in production.
- For customization, edit styles in `styles/globals.css` or extend UI components.
- All feedback and employee actions are type-safe and validated both client-side and via the API.

---

## 🤝 Contributing

See the full contributing guidelines in the main repository for code style, branching, and PR process.

---

## 🆘 Support

For troubleshooting and help, check the Issues page or reach out via your preferred channel.

---

**Happy Feedback-ing!**