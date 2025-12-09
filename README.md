# Voice Gig Connect

A voice-first gig marketplace platform designed for the Caribbean community. Post jobs or find work using voice notes—no typing required.

## 🌟 Features

- **Voice-Only Interface**: Record voice notes to post jobs or find work
- **Caribbean ASR Analysis**: Advanced speech recognition optimized for Caribbean accents and dialects
- **WhatsApp Integration**: Receive and process voice notes via WhatsApp
- **Smart Job Matching**: Connects job posters with skilled workers
- **Real-time Stats**: Track active jobs, workers, and gigs
- **Content Moderation**: Built-in safety checks for all voice submissions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account and project
- (Optional) Twilio account for WhatsApp integration
- (Optional) OpenAI API key for transcription

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd voice-gig-connect
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   For the API server (in `api/` directory), create `api/.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```sh
   # Use either CREATE_TABLES.sql or supabase/schema.sql
   ```

5. **Start the development server**
   ```sh
   npm run dev
   ```

6. **Start the API server** (optional, for WhatsApp integration)
   ```sh
   cd api
   npm install
   npm start
   ```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📁 Project Structure

```
voice-gig-connect/
├── api/                 # Express server for WhatsApp webhooks
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn-ui components
│   │   └── ...         # Feature components
│   ├── lib/            # Utilities and services
│   │   ├── supabase.ts # Supabase client
│   │   └── transcribe.ts # Voice transcription logic
│   ├── pages/          # Page components
│   └── hooks/          # Custom React hooks
├── supabase/           # Database schema
└── public/             # Static assets
```

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Voice Processing**: OpenAI Whisper API
- **WhatsApp Integration**: Twilio API
- **Form Handling**: React Hook Form with Zod validation

## 📱 Available Routes

- `/` - Homepage with voice recorder and stats
- `/voice-demo` - Voice recording demo page
- `/jobs` - Browse all active jobs
- `/find-work` - Find work opportunities
- `/hire-workers` - Browse available workers

## 🔧 Development

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Linting

```sh
npm run lint
```

## 🌐 Deployment

The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.). Make sure to set your environment variables in your hosting platform.

For the API server, deploy to a Node.js hosting service (Railway, Render, Heroku, etc.) and configure your webhook URLs accordingly.

## 📝 Database Schema

The main tables are:
- `voice_gigs` - Stores job postings and work requests
- `gig_matches` - Tracks matches between jobs and workers

See `supabase/schema.sql` or `CREATE_TABLES.sql` for the complete schema.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.
