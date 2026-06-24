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
4. `pnpm db:push` — apply migrations to remote
5. `pnpm dev`
