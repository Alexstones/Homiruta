import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "./supabaseClient";
import { initFirebaseAdmin } from "@/app/lib/firebase-admin";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
            httpOptions: {
                timeout: 10000,
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                googleIdToken: { label: "Google ID Token", type: "text" },
            },
            async authorize(credentials) {
                // 1. Native Mobile Google Sign-In Flow
                if (credentials?.googleIdToken) {
                    try {
                        console.log("[AUTH] Native Login Attempt with token...");
                        const admin = initFirebaseAdmin();
                        const decodedToken = await admin.auth().verifyIdToken(credentials.googleIdToken);
                        const { email, name, picture, uid } = decodedToken;

                        console.log("[AUTH] Token decoded for:", email);

                        if (!email) {
                            console.error("[AUTH] No email in decoded token");
                            return null;
                        }

                        // Find or create user in Supabase
                        let { data: user, error } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', email)
                            .single();

                        if (error && error.code === 'PGRST116') { // Not found
                            console.log("[AUTH] Creating new user profile in Supabase for:", email);
                            const { data: newUser, error: createError } = await supabase
                                .from('users')
                                .insert({
                                    email,
                                    name: name || email.split('@')[0],
                                    image: picture,
                                    password_hash: `google_${uid}_${Date.now()}`,
                                    role: 'user',
                                    subscription_status: 'none',
                                    plan: 'free'
                                })
                                .select('*')
                                .single();

                            if (createError) {
                                console.error("[AUTH] Supabase user creation error:", createError);
                                return null;
                            }
                            user = newUser;
                        } else if (error) {
                            console.error("[AUTH] Supabase query error:", error);
                            return null;
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            sosContact: user.sos_contact,
                            role: user.role || 'user',
                            subscriptionStatus: user.subscription_status || 'none',
                            plan: user.plan || 'free',
                            preferredMapApp: user.preferred_map_app,
                            vehicleType: user.vehicle_type
                        };

                    } catch (error: any) {
                        console.error("[AUTH] Google Token Verification Error:", error.message || error);
                        throw new Error(`Firebase Auth Error: ${error.message}`);
                    }
                }

                // 2. Standard Email/Password Flow
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single();

                    if (error || !user) {
                        console.error("[AUTH] User not found or Supabase error:", error);
                        return null;
                    }

                    if (!user.password_hash) {
                        console.error("[AUTH] User has no password (maybe oauth user?)");
                        return null;
                    }

                    const isValid = await compare(credentials.password, user.password_hash);

                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        sosContact: user.sos_contact,
                        role: user.role || 'user',
                        subscriptionStatus: user.subscription_status || 'none',
                        plan: user.plan || 'free',
                        preferredMapApp: user.preferred_map_app,
                        vehicleType: user.vehicle_type
                    };
                } catch (error) {
                    console.error("[AUTH] Authorize error:", error);
                    return null;
                }
            }
        }),
    ],
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const { data: existingUser, error } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        // Create user for browser-side Google Login
                        await supabase
                            .from('users')
                            .insert({
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                role: 'user',
                                plan: 'free',
                                subscription_status: 'none'
                            });
                    }
                } catch (error) {
                    console.error("[AUTH] Error in signIn callback:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.plan = user.plan;
                token.subscriptionStatus = user.subscriptionStatus;
                token.preferredMapApp = user.preferredMapApp;
                token.vehicleType = user.vehicleType;
                token.sosContact = user.sosContact;
            }

            if (trigger === "update" && session) {
                if (session.sosContact !== undefined) token.sosContact = session.sosContact;
                if (session.role !== undefined) token.role = session.role;
                if (session.plan !== undefined) token.plan = session.plan;
                if (session.subscriptionStatus !== undefined) token.subscriptionStatus = session.subscriptionStatus;
                if (session.preferredMapApp !== undefined) token.preferredMapApp = session.preferredMapApp;
                if (session.vehicleType !== undefined) token.vehicleType = session.vehicleType;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.plan = token.plan as string;
                session.user.subscriptionStatus = token.subscriptionStatus as string;
                session.user.preferredMapApp = token.preferredMapApp as string;
                session.user.vehicleType = token.vehicleType as string;
                session.user.sosContact = token.sosContact as string;
            }
            return session;
        },

    },
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    debug: true,
};

