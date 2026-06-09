import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
