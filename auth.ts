import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  endVisitSessions,
  startVisitSession,
  trackEvent,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    // id в сессии — для requireUser и привязки Decision к userId
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      await startVisitSession(user.id);
      await trackEvent("LOGIN", user.id);
    },
    async signOut(message) {
      const session = "session" in message ? message.session : null;
      const userId =
        session && typeof session === "object" && "userId" in session
          ? String((session as { userId?: string }).userId ?? "")
          : "";
      if (!userId) return;
      await endVisitSessions(userId);
      await trackEvent("LOGOUT", userId);
    },
  },
});
