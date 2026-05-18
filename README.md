# Mohtade's Shop Setup Instructions

## Environment Variables
Create a `.env` file with the following:
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=Mohtade's Shop <bookings@yourdomain.com>
JWT_SECRET=your_super_secret_key
ADMIN_EMAIL=admin@mohtade.com
ADMIN_PASSWORD=mohtade_secure_pass
```

Get a Resend API key at [resend.com](https://resend.com). The `from` address must use a [verified domain](https://resend.com/docs/dashboard/domains/introduction) (or use Resend's test sender for development).

## Running the App
1. Install dependencies: `npm install`
2. Add `GOOGLE_APPLICATION_CREDENTIALS` and `RESEND_API_KEY` to `.env`.
3. Development: `npm run dev`
4. Production: `npm run build` then `npm start`
5. The app will be available on port 3000.

## Backend Architecture
- **Express**: Authentication, catalog APIs, appointment management, email via Resend.
- **Firestore**: Stores all data.
- **Firebase Admin**: Privileged Firestore access on the server.

## Frontend
- **React + Tailwind**: Luxury dark theme with gold accents.
- **Framer Motion**: Smooth animations.
- **Lucide React**: Premium icons.

## Email Notifications
- **Booking acceptance**: Customer receives an email with barber, service, date, and allocated time slot (via [Resend API](https://resend.com/docs/api-reference/emails/send-email)).
