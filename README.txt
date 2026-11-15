Khael Ashly P. Tena - React Portfolio (React + Express + Prisma ORM + MySQL)

ONE-TIME SETUP
1. In MySQL Workbench, run your CREATE TABLE script, then backend/seed.sql (only once).
2. Edit backend/.env: set DB_PASSWORD / DATABASE_URL (your MySQL login) and
   ADMIN_PASSWORD (the password for the /admin page - change it from the default!).
3. In the backend folder:
     npm install
     npx prisma generate

RUN (two terminals)
Terminal 1 (backend):   cd backend  then  npm run dev
Terminal 2 (front end): from the project root: npm install  then  npm run dev

PAGES
  http://localhost:5173/        public portfolio (visitors)
  http://localhost:5173/admin   admin page: add / edit / delete projects and
                                certificates, read / delete contact messages

CRUD with Prisma (backend/server.js)
  Create  prisma.<table>.create()
  Read    prisma.<table>.findMany()
  Update  prisma.<table>.update()
  Delete  prisma.<table>.delete()

Test the backend alone: http://localhost:5000/api/health and /api/projects
View your data in a browser: cd backend  then  npx prisma studio
