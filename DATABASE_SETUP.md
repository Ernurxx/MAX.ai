# Database Setup Guide for MAX.AI

## Installing PostgreSQL on Windows

### Method 1: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the PostgreSQL installer for Windows
   - Run the installer

2. **During Installation:**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set a password for the `postgres` superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default

3. **After Installation:**
   - PostgreSQL service should start automatically
   - Verify it's running in Services (services.msc)

### Method 2: Using Chocolatey (if you have it)

```powershell
choco install postgresql
```

### Method 3: Using Docker (Alternative)

If you have Docker installed:

```bash
docker run --name maxai-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=maxai -p 5432:5432 -d postgres
```

Then update your `.env`:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/maxai?schema=public"
```

## After Installation

1. **Start PostgreSQL Service:**
   ```powershell
   # Check if service exists
   Get-Service -Name postgresql*
   
   # Start the service (replace with actual service name)
   Start-Service postgresql-x64-XX  # Replace XX with your version
   ```

2. **Create the Database:**
   - Open pgAdmin 4 (installed with PostgreSQL)
   - Connect to localhost server
   - Right-click "Databases" → Create → Database
   - Name: `maxai`
   - Click Save

   OR use command line:
   ```bash
   psql -U postgres
   CREATE DATABASE maxai;
   \q
   ```

3. **Update `.env` file:**
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/maxai?schema=public"
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

4. **Test Connection:**
   ```bash
   npm run db:push
   ```

## Troubleshooting

### Can't connect to localhost:5432
- Check if PostgreSQL service is running: `Get-Service postgresql*`
- Check Windows Firewall isn't blocking port 5432
- Verify PostgreSQL is listening on port 5432

### Authentication failed
- Double-check username and password in DATABASE_URL
- Default username is usually `postgres`
- Password is what you set during installation

### Database doesn't exist
- Create it using pgAdmin or: `CREATE DATABASE maxai;`

## Quick Start with SQLite (Alternative)

If you want to use SQLite instead for development:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Run:
   ```bash
   npm run db:push
   ```

Note: SQLite is easier for development but PostgreSQL is recommended for production.
