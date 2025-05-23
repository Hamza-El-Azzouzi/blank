import { NextResponse } from 'next/server';

export default async function Middleware(request) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("sessionId");
    

    if (pathname.startsWith("/_next")) {
        return NextResponse.next();
    }

    const restrictedRoutesForLoggedInUsers = ["/signin", "/signup"];
    const isRestrictedRoute = restrictedRoutesForLoggedInUsers.includes(pathname);

 
    if (!session) {
        return isRestrictedRoute 
            ? NextResponse.next()
            : NextResponse.redirect(new URL('/signin', request.url));
    }

    if (isRestrictedRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        const link = process.env.ENVIREMENT === "Developpement"
            ? `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`
            : "http://blank_backend_1:1414/api/integrity";

        const response = await fetch(link, {
            method: "POST",
            credentials: "include",
            headers: { 'content-type': "application/json" },
            body: JSON.stringify(session),
        });

        const data = await response.json();

        if (data.status !== 200) {
            const response = NextResponse.redirect(new URL('/signin', request.url));
            response.cookies.set('sessionId', '', { expires: new Date(0), path: '/' });
            response.headers.set("Cache-Control", "no-store");
            return response;
        }

        return NextResponse.next().headers.set("Cache-Control", "no-store");
    } catch (error) {
        console.error(error);
        const response = NextResponse.redirect(new URL("/signin", request.url));
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
}
