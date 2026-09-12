# ForgeWorks Industrial Website

A responsive Next.js + TypeScript website for an industrial fabrication and 3D-printing company.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

Add the Neon PostgreSQL connection string as `DATABASE_URL` in `.env.local`. The migration command creates the tables and safely imports any legacy JSON records. Replace `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` with strong production values before deploying.

## Arvan Cloud image uploads

The administrator selects one JPG, PNG, WebP, or AVIF image (up to 8 MB) in the project form. The browser sends it to the protected upload endpoint; that endpoint uploads it to Arvan Cloud Object Storage and returns the public object URL for the project. Images are not written to the application server.

Add these values to `.env.local` before using uploads:

```env
ARVAN_ACCESS_KEY=...
ARVAN_SECRET_KEY=...
ARVAN_BUCKET=your-bucket-name
ARVAN_ENDPOINT=https://your-s3-endpoint.example
ARVAN_REGION=your-region
ARVAN_PUBLIC_BASE_URL=https://your-public-media-host.example
```

Make sure the bucket permits public reads for uploaded project images. The access key and secret must remain server-only and should never have a `NEXT_PUBLIC_` prefix.

## Included

- Responsive industrial-themed home, about, contact, project directory, project detail, login, dashboard, and 404 pages.
- Separate searchable industrial and 3D-printing project catalogues.
- Animated cards and reveals with Framer Motion.
- JWT, HttpOnly-cookie admin login with basic login/contact rate limiting.
- Secure admin CRUD API for project management.
- React Hook Form and Zod validation on client and API routes.
- Toast feedback for sign-in, project changes, and contact enquiries.

## Data and deployment notes

Projects, customer contact details, request descriptions, attachment metadata, and four-digit order numbers are stored in Neon PostgreSQL. Uploaded files remain in private object storage; only their metadata and storage keys are stored in PostgreSQL. The files in `data/` are retained solely as a migration backup and are no longer read by the running website.

`/api/contact` validates and rate-limits submissions and returns a success response. Connect a transactional email provider such as Resend or Postmark in that route before using it for live customer enquiries.
