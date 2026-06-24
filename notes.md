To do list 

Features 
- add new todos 
- mark as complete and mark as incomplete
- delete a todo 

Tech
- vite 
- vanilla js 
- Supabase (Postgres + @supabase/supabase-js)
- Schema managed via Supabase CLI migrations (`supabase/migrations/`)

Setup
1. Copy `.env.example` to `.env` and fill in Supabase credentials
2. `supabase login`
3. `supabase link --project-ref iykcvtyacjhbyzhstkcy`
4. In the [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers, enable **Anonymous Sign-Ins**
5. `pnpm db:push` — apply migrations to remote
6. `pnpm dev`

Auth
- First visit signs in anonymously (transparent to the user)
- Sign up converts the anonymous account in place (todos stay attached)
- Log in merges guest todos into the existing account
- Sign out starts a fresh anonymous session
