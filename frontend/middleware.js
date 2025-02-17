import { NextResponse } from 'next/server';

export default async function Middleware(request) {
    const restrictedRoutesForLoggedInUsers = ["/signin", "/signup"];
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/_next")) {
        return NextResponse.next();
    }

    const session = request.cookies.get("sessionId");

    if (session) {

        if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
                method: "POST",
                credentials: "include",
                headers: { 'content-type': "application/json" },
                body: JSON.stringify(session),
            });

            const data = await response.json();
            if (data.status !== 200) {
                const response = NextResponse.redirect(new URL('/signin', request.url));
                response.cookies.set('sessionId', '', {
                    expires: new Date(0),
                    path: '/',
                });
                return response;
            }

            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }
    else {
        if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/signin', request.url));
    }
}