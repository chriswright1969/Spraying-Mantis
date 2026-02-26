# Spraying Mantis Auto Repairs

A GitHub/Render-ready Node.js + Express + EJS brochure website for **Spraying Mantis Auto Repairs**.

## Included

- Responsive homepage in EJS
- Express server with static assets
- Two logo image options in `/public`
- Contact form with optional SMTP email sending via Nodemailer
- Render-friendly `PORT` handling
- `.env.example` for configuration

## Project structure

- `server.js` – Express app and routes
- `views/index.ejs` – Homepage template
- `public/styles.css` – Site styling
- `public/logo.png` – Logo option 1
- `public/logo2.png` – Logo option 2 (default)
- `.env.example` – Example environment variables

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Then open `http://localhost:3000`.

## Deploy on Render

1. Push these files to your GitHub repo.
2. Create a new Node web service in Render from that repo.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables from `.env.example` as needed.
5. Set your custom domain to `sprayingmantis.co.uk` in Render and point DNS there.

## Contact form email

The contact form works in two modes:

### 1) With SMTP configured
If you set these environment variables, the form will send email to `FORM_RECIPIENT`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### 2) Without SMTP configured
If SMTP is not set yet, form submissions are still accepted and written to the server logs.

## Quick customisations

### Use the other logo
Change this in `.env`:

```env
DEFAULT_LOGO=/public/logo.png
```

or keep:

```env
DEFAULT_LOGO=/public/logo2.png
```

### Update address and opening hours
Edit these in `.env`:

```env
ADDRESS_LINE_1=Unit 1, Example Trade Estate
ADDRESS_LINE_2=Wrexham, LL00 0AA
OPENING_HOURS=Mon-Fri 8:00am-5:00pm
```

## Good next upgrades

- Replace gallery placeholders with real repair photos
- Replace sample reviews with genuine customer feedback
- Add Google Maps embed or directions section
- Add a dedicated gallery page
- Add privacy policy and cookies/privacy footer links if needed
