import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the built server handler
const serverPath = join(__dirname, "../dist/server/server.js");
const { default: serverHandler } = await import(serverPath);

// Helper to convert Node.js request to Web Request
function nodeRequestToWebRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  
  let body = undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    // For POST/PUT/PATCH, we need to read the body
    body = req.body;
  }

  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: body,
  });
}

// Helper to convert Web Response to Node.js response
async function webResponseToNodeResponse(webResponse, res) {
  res.status(webResponse.status);
  
  // Set headers
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Send body
  const body = await webResponse.text();
  res.send(body);
}

// Vercel Serverless Function handler
export default async function handler(req, res) {
  try {
    // Convert Node.js request to Web API Request
    const webRequest = nodeRequestToWebRequest(req);

    // Call the server handler
    const webResponse = await serverHandler.fetch(webRequest);

    // Convert Web API Response back to Node.js response
    await webResponseToNodeResponse(webResponse, res);
  } catch (error) {
    console.error("Error in server handler:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}
