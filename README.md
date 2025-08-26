Shopping List (FastAPI + Next.js)



A tiny full-stack project: FastAPI backend (JWT auth, SQLite) + Next.js frontend (App Router, Axios, Bootstrap).

Create an account, log in, add items, group them into lists, and delete when done.



Features



Email/password sign up \& JWT login



CRUD:



items (name, description)



lists composed of selected items



Protected pages on the frontend



Swagger/OpenAPI docs at /docs



Ready for Windows (PowerShell) and cross-platform use



Tech Stack



Backend: Python 3.12, FastAPI, SQLAlchemy, Pydantic, Uvicorn, python-jose, passlib (bcrypt), SQLite



Frontend: Next.js 15 (App Router), React, Axios, Bootstrap



Project Structure

shopping\_list/

├─ fastapi/

│  ├─ api/

│  │  ├─ main.py

│  │  ├─ database.py

│  │  ├─ models.py

│  │  ├─ deps.py

│  │  └─ routers/

│  │     ├─ auth.py

│  │     ├─ items.py

│  │     └─ lists.py

│  └─ requirements.txt

└─ nextjs/

&nbsp;  ├─ src/app/

&nbsp;  │  ├─ components/ProtectedRoute.js

&nbsp;  │  ├─ context/AuthContext.js

&nbsp;  │  ├─ login/page.js

&nbsp;  │  └─ page.js

&nbsp;  ├─ package.json

&nbsp;  └─ next.config.mjs



Quick Start



Run backend and frontend in two terminals.



1\) Backend (FastAPI)

\# From repository root

cd fastapi



\# Create \& activate venv (Windows PowerShell)

python -m venv .venv

.\\.venv\\Scripts\\Activate



\# Install deps

pip install -r requirements.txt



\# Create a .env file (see example below) and then run the API

python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000





Open docs: http://127.0.0.1:8000/docs



2\) Frontend (Next.js)

\# In a new terminal

cd nextjs

npm install

npm run dev





Open app: http://localhost:3000



Environment Variables



Create fastapi/.env:



\# Secret \& JWT settings

AUTH\_SECRET\_KEY=change\_me\_to\_a\_random\_long\_string

AUTH\_ALGORITHM=HS256





The frontend is hard-coded to call http://localhost:8000.

If you change the backend host/port, update the API URLs in nextjs/src/app/page.js and nextjs/src/app/login/page.js.



How to Use



Start the API and open /docs.



Create User → POST /auth/



Login → POST /auth/token → copy the access\_token.



Open the frontend → /login → sign in.



Create Items, then create Lists by selecting items.



Use Delete buttons to remove items/lists.



API Overview



Auth



POST /auth/ – create user



POST /auth/token – login (OAuth2 password flow), returns JWT



Items (requires Authorization: Bearer <token>)



GET /items/ – list items



POST /items/ – create item



DELETE /items/{item\_id} – delete item



Lists (requires Authorization: Bearer <token>)



GET /lists/ – list lists (with joined items)



POST /lists/ – create list with items: \[id, ...]



DELETE /lists/{list\_id} – delete list



Scripts



Backend



uvicorn api.main:app --host 127.0.0.1 --port 8000





Frontend



npm run dev      # start dev server

npm run build    # production build

npm start        # run production server after build



Troubleshooting



401 Unauthorized – include Authorization: Bearer <token> header or re-login.



422 Unprocessable Entity – check body shape (e.g., items must be an array of item IDs).



CORS – backend allows http://localhost:3000 by default (see api.main: CORSMiddleware).



Port already in use – change ports (--port for API, -p for Next).



Reset DB – stop API and delete the SQLite file (if present); the app will recreate tables.



License



This project is for learning/demo purposes. You may adapt it for your own use.

