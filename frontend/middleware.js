import { NextResponse } from 'next/server';

export default async function Middleware(request) {
    const restrictedRoutesForLoggedInUsers = ["/signin", "/signup"];
    const { pathname } = request.nextUrl;

    // Exclude Next.js internal paths
    if (pathname.startsWith("/_next")) {
        return NextResponse.next();
    }

    // Get the session cookie
    const session = request.cookies.get("sessionId");

    // If the session cookie exists
    if (session) {
        // Redirect logged-in users away from restricted routes
        if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Validate the session integrity
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
                method: "POST",
                credentials: "include",
                headers: { 'content-type': "application/json" },
                body: JSON.stringify(session), // Send only the session value
            });

            const data = await response.json();
            console.log("Session validation response:", data);

            // If the session is invalid, delete the cookie and redirect to /signin
            if (data.status !== 200) {
                console.log("Session is invalid, deleting cookie and redirecting to /signin");
                const response = NextResponse.redirect(new URL('/signin', request.url));
                response.cookies.set('sessionId', '', {
                    expires: new Date(0), // Expire the cookie
                    path: '/', // Ensure the cookie path matches the original
                });
                return response;
            }

            // If the session is valid, allow the request to proceed
            return NextResponse.next();
        } catch (error) {
            console.error("Error validating session integrity:", error);
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    // If the session cookie does not exist
    else {
        // Allow access to /signin and /signup routes
        if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
            return NextResponse.next();
        }

        // Redirect to /signin for all other routes
        console.log("User is not logged in, redirecting to /signin");
        return NextResponse.redirect(new URL('/signin', request.url));
    }
}