# Build and Link pdfme to wgs-reports

## Step 1: Install dependencies (IMPORTANT - Do this first!)

```bash
cd C:\Users\sandi\source\repos\pdfme

# Install all dependencies including npm-run-all and TypeScript
npm install
```

**Wait for this to complete** - this installs all build tools needed.

## Step 2: Build pdfme packages

```bash
# Still in C:\Users\sandi\source\repos\pdfme

# Build all packages (this will take 5-10 minutes)
npm run build
```

**Note:** If you get "npm-run-all is not recognized", make sure Step 1 completed successfully.

## Step 3: Link the UI package

```bash
# Navigate to the UI package
cd C:\Users\sandi\source\repos\pdfme\packages\ui

# Create a global link
npm link
```

## Step 4: Link in wgs-reports project

```bash
# Navigate to your wgs-reports project
cd C:\Users\sandi\source\repos\wgs-reports

# Link the local pdfme UI package
npm link @pdfme/ui
```

## Step 5: Verify the link

After linking, you should see a symlink in:
`C:\Users\sandi\source\repos\wgs-reports\node_modules\@pdfme\ui`

This will point to:
`C:\Users\sandi\source\repos\pdfme\packages\ui`

## Step 6: Restart your dev server

```bash
# In wgs-reports directory
npm run dev
```

## How to Unlink (if needed)

If you want to go back to the npm package version:

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm unlink @pdfme/ui
npm install
```

## Rebuilding After Changes

Whenever you make changes to the pdfme code:

```bash
cd C:\Users\sandi\source\repos\pdfme
npm run build:ui
```

Then restart your wgs-reports dev server to see the changes.
