# Fix npm and Prisma Installation Issues

## Current Problem

Your npm is configured with `offline = true` and there are network connectivity issues preventing package installation. Prisma CLI is not installed, which is why `npm run db:generate` fails.

## Solutions

### Option 1: Fix npm Configuration (Recommended)

1. **Check your npm proxy settings:**
   ```powershell
   npm config get proxy
   npm config get https-proxy
   ```

2. **If proxy is set incorrectly, remove it:**
   ```powershell
   npm config delete proxy
   npm config delete https-proxy
   ```

3. **Disable offline mode:**
   ```powershell
   npm config set offline false
   ```
   Or unset the environment variable:
   ```powershell
   [Environment]::SetEnvironmentVariable('npm_config_offline', $null, 'User')
   ```

4. **Install Prisma:**
   ```powershell
   npm install
   ```

5. **Generate Prisma Client:**
   ```powershell
   npm run db:generate
   ```

### Option 2: Manual Prisma Installation

If network issues persist, you can try:

1. **Download Prisma manually** from a machine with internet access
2. **Copy the Prisma binary** to `node_modules\.bin\prisma.cmd`
3. **Or use a portable Node.js installation** with Prisma pre-installed

### Option 3: Use Alternative Package Manager

Try using `yarn` or `pnpm` instead:

```powershell
# Install yarn globally (if you have internet elsewhere)
npm install -g yarn

# Then use yarn
yarn install
yarn prisma generate
```

### Option 4: Check Network/Firewall

The error `ECONNREFUSED 127.0.0.1:9` suggests a proxy misconfiguration. Check:

1. **Windows Proxy Settings:**
   - Settings → Network & Internet → Proxy
   - Make sure proxy settings are correct

2. **Corporate Firewall:**
   - If behind a corporate firewall, contact IT for npm registry access

3. **VPN:**
   - If using VPN, try disconnecting temporarily

## After Prisma is Installed

Once Prisma CLI is available, run:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

This will:
1. Generate the Prisma Client code
2. Push the schema to your database
3. Seed the database with initial data

## Verify Installation

Check if Prisma is installed:

```powershell
npx prisma --version
# Should output: prisma 5.7.0 (or similar)
```

If this works, you can then run `npm run db:generate`.
