# Cleanup Commands for Windows

## PowerShell Commands

If you need to manually clean up files on Windows PowerShell:

### Remove .next folder:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### Remove node_modules/.cache:
```powershell
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### Remove Prisma cache:
```powershell
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
```

### Remove everything and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
```

## Using npm scripts

After installing dependencies, you can use:
```bash
npm run clean
```

This will clean the `.next` folder and `node_modules/.cache`.
