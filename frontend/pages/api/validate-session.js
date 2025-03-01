export default async function handler(req, res) {
  const sessionId = req.body;
  console.log("validator", sessionId);
  
  // Set proper content type
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
      method: "POST",
      credentials: "include",
      headers: { 
        'Content-Type': "application/json",
        'Accept': "application/json"
      },
      body: JSON.stringify(sessionId),
    });

    if (!response.ok) {
      throw new Error('Invalid session');
    }

    const data = await response.json();
    res.status(200).json({
      status: 200,
      isValid: data.data !== null,
      data: data.data
    });
  } catch (error) {
    res.status(401).json({
      status: 401,
      isValid: false,
      error: error.message
    });
  }
}
