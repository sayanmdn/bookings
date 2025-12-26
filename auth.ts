import NextAuth, { DefaultSession, User } from "next-auth"
import { JWT } from "@auth/core/jwt"
import Google from "next-auth/providers/google"
import { UserRole } from "@/lib/types/user"

// Extend NextAuth types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  callbacks: {
    // Redirect after sign in based on role
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login, middleware will route based on role
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/dashboard`
    },
    // Called on successful sign in
    async signIn({ user, account }) {
      try {
        // Dynamic imports to avoid loading in Edge Runtime
        const dbConnect = (await import("@/lib/mongodb")).default
        const DefaultUser = (await import("@/lib/models/DefaultUser")).default

        await dbConnect()

        const email = user.email?.toLowerCase()
        if (!email) return false

        // Check if user already exists
        const dbUser = await DefaultUser.findOne({ email })

        if (dbUser) {
          // Existing user - just return true (don't modify role)
          return true
        } else {
          // New user - determine role based on email
          const role = email === "sayanmdn@gmail.com"
            ? UserRole.ADMIN
            : UserRole.USER

          // Create new user
          await DefaultUser.create({
            email,
            name: user.name || '',
            profileImage: user.image,
            provider: account?.provider || 'google',
            providerId: account?.providerAccountId || '',
            role
          })

          return true
        }
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },

    // Add user data to JWT token
    async jwt({ token, user, trigger }) {
      try {
        if (user) {
          // Dynamic imports to avoid loading in Edge Runtime
          const dbConnect = (await import("@/lib/mongodb")).default
          const DefaultUser = (await import("@/lib/models/DefaultUser")).default

          // Initial sign in - fetch role from database
          await dbConnect()
          const dbUser = await DefaultUser.findOne({
            email: user.email?.toLowerCase()
          })

          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role
          } else {
            // Fallback if user not found - should not happen but prevents issues
            console.error("User not found in database during JWT callback:", user.email)
            token.role = UserRole.USER
          }
        } else if (trigger === "update") {
          // Dynamic imports to avoid loading in Edge Runtime
          const dbConnect = (await import("@/lib/mongodb")).default
          const DefaultUser = (await import("@/lib/models/DefaultUser")).default

          // Session update - refresh role from database
          await dbConnect()
          const dbUser = await DefaultUser.findOne({
            email: token.email?.toLowerCase()
          })

          if (dbUser) {
            token.role = dbUser.role
          }
        }
      } catch (error) {
        console.error("Error in JWT callback:", error)
        // Set default role on error to prevent issues
        if (!token.role) {
          token.role = UserRole.USER
        }
      }

      return token
    },

    // Add user data to session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Ensure role is always set - fallback to USER if not present
        session.user.role = (token.role as UserRole) || UserRole.USER
      }
      return session
    }
  }
})
