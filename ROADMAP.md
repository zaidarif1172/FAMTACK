# FamTalk - Future Roadmap

If you have extra time during the hackathon or want to take this project further, here are some recommended features:

## 1. Group Chats
-   Allow users to create groups.
-   Add "Admin" roles.
-   Schema update: `ChatRoom` model linking multiple `User`s.

## 2. Media Sharing
-   Allow sending images and files.
-   Integrate with AWS S3 or Cloudinary for storage.
-   Update `Message` schema to include `attachmentUrl` and `attachmentType`.

## 3. Voice & Video Calls
-   Integrate WebRTC (peer-to-peer).
-   Use `simple-peer` or a dedicated service like Agora.io for easier implementation.
-   Add "Call" UI with video toggles.

## 4. Push Notifications
-   Use Web Push API or Firebase Cloud Messaging (FCM).
-   Notify users even when the tab is closed.

## 5. Deployment
-   **Frontend**: Vercel or Netlify.
-   **Backend**: Render, Railway, or Heroku.
-   **Database**: Supabase or Neon (PostgreSQL).

## 6. Security Hardening
-   Implement Refresh Tokens.
-   Rate limiting on API routes.
-   Input sanitization (Zod validation).
