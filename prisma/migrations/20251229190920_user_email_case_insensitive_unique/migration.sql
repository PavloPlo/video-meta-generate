-- Enforce case-insensitive uniqueness for email
CREATE UNIQUE INDEX "User_email_lower_unique"
ON "User" (LOWER("email"));
