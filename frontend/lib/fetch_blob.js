import * as cookies from '@/lib/cookie';

export const fetchBlob = async (url) => {
    const token = cookies.GetCookie("sessionId")
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load avatar");

        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        return objectURL;
    } catch (error) {
        console.error(error);
    }
};