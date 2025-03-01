// import { NextResponse } from "next/server";

// export default function middleware(request) {
//     console.log("🔹 Middleware is running");
//     console.log("🔹 Checking for session...");
//     const restrictedRoutesForLoggedInUsers = ["/signin", "/signup"];
//     const { pathname } = request.nextUrl;

//     if (pathname.startsWith("/_next")) {
//         return NextResponse.next();
//     }

//     const sessionId = request.cookies.get("sessionId");
    
//     if (sessionId) {
//         console.log("🔹 Session ID:", sessionId.value);
//         console.log("🔹 Backend Domain:", process.env.NEXT_PUBLIC_BACK_END_DOMAIN);

//         if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
//             console.log("User already logged in, redirecting from auth page to home");
//             return NextResponse.redirect(new URL("/", request.url));
//         }

//         console.log("Backend Domain:", process.env.NEXT_PUBLIC_BACK_END_DOMAIN);

//         if (!process.env.NEXT_PUBLIC_BACK_END_DOMAIN) {
//             console.error("Backend domain environment variable is not set");
//             return NextResponse.next();
//         }

//         const backendUrl = process.env.NEXT_PUBLIC_BACK_END_DOMAIN;
//         const apiUrl = backendUrl.endsWith('/') 
//             ? `${backendUrl}api/integrity`
//             : `${backendUrl}/api/integrity`;

//         console.log("Calling integrity API at:", apiUrl);

//         return fetch(apiUrl, {
//             method: "POST",
//             credentials: "include",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ sessionId: sessionId.value }),
//         })
//         .then(response => {
//             console.log(`Integrity response status: ${response.status}`);
//             if (!response.ok) {
//                 throw new Error(`Fetch failed with status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Integrity data:", data);
//             if (data.status !== 200) {
//                 console.warn("Integrity check failed, redirecting to signin...");
//                 const redirectResponse = NextResponse.redirect(new URL("/signin", request.url));
//                 redirectResponse.cookies.set("sessionId", "", {
//                     expires: new Date(0),
//                     path: "/",
//                 });
//                 return redirectResponse;
//             }
//             return NextResponse.next();
//         })
//         .catch(error => {
//             console.error("Integrity check failed:", error);
//             console.log("Error type:", typeof error);
//             console.log("Error message:", error.message);
//             console.log("Error stack:", error.stack);

//             const errorResponse = NextResponse.redirect(new URL("/signin", request.url));
//             errorResponse.cookies.set("sessionId", "", {
//                 expires: new Date(0),
//                 path: "/",
//             });
//             return errorResponse;
//         });
//     } else {
//         if (restrictedRoutesForLoggedInUsers.includes(pathname)) {
//             return NextResponse.next();
//         }
//         return NextResponse.redirect(new URL("/signin", request.url));
//     }
// }
import { NextResponse } from "next/server";

export default function middleware(request) {
    const { pathname } = request.nextUrl;
    const sessionId = request.cookies.get("sessionId");

    console.log(`🔹 Middleware triggered for path: ${pathname}`);
    console.log(`🔹 Session ID: ${sessionId || "No session"}`);

    // Skip middleware for Next.js internal paths
    if (pathname.startsWith("/_next")) {
        console.log("🔹 Skipping internal Next.js path");
        return NextResponse.next();
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/signin", "/signup"];
    if (publicRoutes.includes(pathname)) {
        console.log("🔹 Public route accessed");
        if (sessionId) {
            console.log("🔹 User already logged in, redirecting to home");
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // If no session ID, redirect to signin
    if (!sessionId) {
        console.log("🔹 No session ID, redirecting to signin");
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Validate session integrity with the backend
    console.log("🔹 Validating session integrity...");
    return validateSessionIntegrity(sessionId, request)
        .then(({ isValid, userId }) => {
            console.log(isValid,userId)
            if (!isValid) {
                console.log("🔹 Session invalid, redirecting to signin");
                const response = NextResponse.redirect(new URL("/signin", request.url));
                response.cookies.delete("sessionId");
                return response;
            }

            console.log(`🔹 Session valid for user ${userId}`);
            return NextResponse.next();
        })
        .catch((error) => {
            console.error("❌ Session validation failed:", error);
            const response = NextResponse.redirect(new URL("/signin", request.url));
            response.cookies.delete("sessionId");
            return response;
        });
}

async function validateSessionIntegrity(sessionId) {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_END_DOMAIN;
    if (!backendUrl) {
        throw new Error("Backend URL is not configured");
    }
    
    const apiUrl = backendUrl.endsWith('/')
        ? `${backendUrl}api/integrity`
        : `${backendUrl}/api/integrity`;

    console.log(`🔐 Calling integrity API at: ${apiUrl}`);
    console.log(`🔐 Request payload:`, { sessionId: sessionId.value });

    return fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: sessionId.value }),
    })
        .then((response) => {
            console.log(`🔔 Backend response status: ${response.status}`);
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then((data) => {
            console.log(`🔔 Backend response data:`, data);
            if (data.status !== 200 || !data.userId) {
                throw new Error("Invalid session or missing user ID");
            }
            return { isValid: true, userId: data.userId };
        })
        .catch((error) => {
            console.log(error)
            console.error("❌ Fetch error details:", {
                name: error.name,
                message: error.message,
                code: error.code, // Node.js system error code
                stack: error.stack,
            });
            throw error;
        });
}
// Standard middleware config
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};