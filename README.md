# 🥧 FLOW OF PI: The Infinite Masterpiece

<img width="3801" height="1652" alt="image" src="https://github.com/user-attachments/assets/195e68d7-f0ff-4a14-aa61-e9fad3aafcff" />


**FLOW OF PI** is a generative "Living Art" project that visualizes the infinite digits of Pi in real-time, backed by a global community of human "curators." Every user who joins the flow unlocks a permanent digit in the sequence, contributing to a massive, ever-evolving digital canvas.

## ✨ Features

- **Live Artistic Engine**: Real-time canvas rendering of Pi digits with high-fidelity geometric aesthetics.
- **Human-Backed Timeline**: A social timeline tracing the sequence of Pi, with each digit linked to the user who claimed it.
- **Dynamic Wallpapers**: Automated generation of custom-branded wallpapers for every iPhone resolution (iPhone 11 through iPhone 16 Pro Max).
- **Instagram Integration**: High-fidelity share cards designed for Instagram Stories, featuring unique chord visualizations and social handles.
- **Modernist Branding**: A "Modernist Minimalist" design system with high-contrast typography and geometric Pi iconography.

## 🛠️ Technology Stack

- **Frontend**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) + [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [Express](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [Supabase Storage](https://supabase.com/storage) (for persistent generative art)
- **Deployment**: [Koyeb](https://www.koyeb.com/) (Docker)

## 🚀 Deployment

The project is optimized for deployment on **Koyeb** using the included `Dockerfile`.

### Environment Variables
The following variables are required for the "FLOW OF PI" engine:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NODE_ENV=production
```

### Quick Start (Local)
1. Clone the repository.
2. Run `npm install`.
3. Set up your `.env` file.
4. Run `npm run dev` to start the development server.

## 🎨 Artistic Vision

"FLOW OF PI" is more than a data visualization; it is a collaboration between mathematics and humanity. By assigning each digit to a person, we transform an abstract number into a shared historical record.

---

Built with ❤️ for the Pi Community.  
Visit the live site: [flowofpi.com](https://flowofpi.com)
