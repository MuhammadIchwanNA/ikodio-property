import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    Credentials({
      id: 'user-credentials',
      name: 'User Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string,
            role: UserRole.USER,
          },
        });

        if (!user) {
          throw new Error('Email atau password salah');
        }

        if (!user.password) {
          throw new Error('Akun ini menggunakan social login');
        }

        if (!user.isVerified) {
          throw new Error('Email belum diverifikasi. Silakan cek email Anda');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Email atau password salah');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
          isVerified: user.isVerified,
        };
      },
    }),
    Credentials({
      id: 'tenant-credentials',
      name: 'Tenant Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string,
            role: UserRole.TENANT,
          },
        });

        if (!user) {
          throw new Error('Email atau password salah');
        }

        if (!user.password) {
          throw new Error('Akun ini menggunakan social login');
        }

        if (!user.isVerified) {
          throw new Error('Email belum diverifikasi. Silakan cek email Anda');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Email atau password salah');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'twitter') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        const providerMap: Record<string, 'GOOGLE' | 'FACEBOOK' | 'TWITTER'> = {
          google: 'GOOGLE',
          facebook: 'FACEBOOK',
          twitter: 'TWITTER',
        };

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              profileImage: user.image,
              provider: providerMap[account.provider] || 'GOOGLE',
              isVerified: true,
              role: UserRole.USER,
            },
          });
        } else if (!existingUser.isVerified) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { 
              isVerified: true,
              profileImage: user.image || existingUser.profileImage,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login-user',
    error: '/login-user',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Important for Vercel!
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);