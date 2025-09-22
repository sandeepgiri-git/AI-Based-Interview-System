'use server'

import { auth, db } from "@/Firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60*60*24*7;

export async function signUp(params: SignUpParams) {
    const {uid, name, email } = params;
    try {
        const user = await db.collection('users').doc(uid).get();

        if(user.exists) {
            return {
                success: false,
                message: 'User already exist'
            }
        }

        await db.collection('users').doc(uid).set({
            name,
            email
        })
        
        return {
            success : true,
            message: "Account created Successfully"
        }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch(e: any) {
        console.error("error is", e);
        
        if(e.code === 'auth/email-already-exist') {
            return {
                success: false,
                message: "Email already in use"
            }
        }
        else {
            return {
                success: false,
                messade: 'Failed in creating Account'
            }
        }
    }
}

export async function getCurrentUser() : Promise<User | null> {
    const cookie = await cookies();
    const token = cookie.get('session')?.value;

    if(!token) {
        return null;
    }
    console.log(token);

    try {
        const decode = await auth.verifySessionCookie(token, true);
        console.log("Decode is: ",decode);
        
        const userRec = await db.collection('users').doc(decode.uid).get();

        if(!userRec.exists) return null;

        return {
            ...userRec.data(),
            id: userRec.id
        }as User;

    } catch (e) {
        console.log(e);
        return null
    }
}

export async function signIn(params: SignInParams) {
    const {email, idToken} = params;

    try {
        const user = await auth.getUserByEmail(email);

        if(!user) {
            return {
                success: false,
                message: 'Email not exist ! Please create an Account First'
            }
        }

        await setSessionCookie(idToken);

    }catch(e) {
        console.log(e);

        return {
            success: false, 
            message: 'failed to login'
        }
    }
}

export async function setSessionCookie(idToken:string) {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn: ONE_WEEK});

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: "lax"
    })
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user; 
}