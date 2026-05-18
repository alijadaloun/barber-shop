# Security Specification for Mohtade's Shop

## Data Invariants
- An appointment must have a valid barberId and serviceId.
- A customer cannot create an appointment with an end_time or duration_minutes; these are set by the admin.
- Only admins can read the 'admins' collection.
- Anyone can read 'barbers' and 'services'.
- Anyone can create an appointment with 'pending' status.
- Only admins can update appointment status, durationMinutes, and endTime.
- Customers cannot read appointments they don't own (but since there is no customer login, we'll allow an admin to manage these).
- Actually, the user says "Customers do NOT need login. Only the admin logs in." This means standard security rules for "isOwner" don't apply for customers.
- We might need a way for customers to see their own status, but usually, that's done via SMS.
- Public can read barbers and services.
- Public can create appointments (pending only).
- Admin can read/write everything.

## The Dirty Dozen Payloads
1. Create appointment with status 'confirmed' (Denied)
2. Create appointment with pre-set durationMinutes (Denied)
3. Update appointment status without being admin (Denied)
4. Delete a barber document as non-admin (Denied)
5. Read admin collection as non-admin (Denied)
6. Create appointment with invalid phone number format (Denied)
7. Create appointment for a non-existent barber (Relational write check needed)
8. Update appointment rejectionReason as a non-admin (Denied)
9. Inject 1MB string into customerName (Denied)
10. Update barber bio as non-admin (Denied)
11. Read full list of appointments as non-admin (Denied)
12. Create a service with negative price (Denied)
