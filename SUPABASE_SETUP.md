# Supabase Setup Guide for Crier

This guide walks you through setting up Supabase for the Crier application.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. A Supabase project created
3. The `.env.local` file with Supabase credentials

## 1. Create Supabase Project

1. Go to https://supabase.com and sign in/create account
2. Create a new project
3. Wait for the project to be initialized
4. Copy your Project URL and Anon Key from Settings → API

## 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project:
- Settings → API → Project URL
- Settings → API → Anon public

## 3. Create Database Tables

Go to your Supabase dashboard and run these SQL queries in the SQL Editor:

### Servers Table

```sql
CREATE TABLE servers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own servers"
  ON servers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own servers"
  ON servers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servers"
  ON servers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servers"
  ON servers
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Channels Table

```sql
CREATE TABLE channels (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  webhook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(server_id, name)
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own channels"
  ON channels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channels"
  ON channels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels"
  ON channels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels"
  ON channels
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Logs Table

```sql
CREATE TABLE logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON logs
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Scheduled Table

```sql
CREATE TABLE scheduled (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  avatar_url TEXT,
  channels JSONB NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE scheduled ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled"
  ON scheduled
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled"
  ON scheduled
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled"
  ON scheduled
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled"
  ON scheduled
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. Configure Google OAuth (Optional)

To enable "Sign in with Google":

1. Go to Authentication → Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials (get from Google Cloud Console)
4. Add `http://localhost:5173` to allowed redirect URLs (for dev)
5. Add your production URL to redirect URLs

## 5. Install Dependencies

The app assumes `@supabase/supabase-js` is already installed. If not:

```bash
npm install @supabase/supabase-js
```

## 6. Start the App

```bash
npm run dev
```

## How It Works

- **Authentication**: Users sign in with Google via Supabase Auth
- **Data Isolation**: Row Level Security (RLS) ensures users can only see/modify their own data
- **Webhook Broadcasting**: Messages are sent directly to Discord webhooks from the browser
- **Scheduled Messages**: A client-side check every minute sends due scheduled messages
- **Transmission Log**: All sends are logged to the `logs` table (max 50 entries)

## Troubleshooting

### Cannot connect to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check that your Supabase project is active
- Restart the dev server after changing env vars

### RLS errors
- Ensure all RLS policies are correctly created
- Check that the user is authenticated before running database operations
- Verify that the logged-in user's UUID is being passed correctly

### OAuth not working
- Confirm Google OAuth provider is enabled in Supabase
- Check redirect URLs in both Google Cloud Console and Supabase
- Clear browser cookies and cache if tests don't work

## File Structure

```
src/
├── supabase.js              # Supabase client initialization
├── store/
│   └── useStore.js          # Zustand store with Supabase queries
├── pages/
│   ├── Login.jsx            # Google OAuth login page
│   ├── Landing.jsx          # Public landing page
│   └── Dashboard.jsx        # Main app dashboard
├── components/
│   ├── Sidebar.jsx          # Server list + logout
│   ├── ComposePanel.jsx     # Broadcast composer
│   ├── ChannelManager.jsx   # Channel management
│   ├── SchedulePanel.jsx    # Schedule announcements
│   ├── TransmissionLog.jsx  # Broadcast history
│   └── AddServerModal.jsx   # Add server form
└── App.jsx                  # Auth routing handler
```

## API Reference

### Store Actions

All actions in `useStore.js` are async:

- `setUser(user)` - Set authenticated user
- `loadServers()` - Load all user's servers
- `addServer(server)` - Create new server
- `removeServer(serverId)` - Delete server
- `updateServer(serverId, updates)` - Update server
- `setSelectedServer(serverId)` - Select server
- `addChannel(serverId, channel)` - Add webhook channel
- `removeChannel(serverId, channelId)` - Delete channel
- `updateChannel(serverId, channelId, updates)` - Update channel
- `loadLogs()` - Load transmission logs
- `addLog(log)` - Add broadcast log
- `clearLogs()` - Clear all logs
- `loadScheduled()` - Load scheduled messages
- `addScheduled(scheduled)` - Schedule announcement
- `removeScheduled(scheduledId)` - Delete scheduled

## Security Notes

- Row Level Security (RLS) is enforced on all tables
- Webhook URLs are stored in the database (encrypted in Supabase)
- Discord webhooks are POSTed directly from the browser (no backend)
- User authentication is handled by Supabase Auth
- All data is isolated by user_id at the database level
