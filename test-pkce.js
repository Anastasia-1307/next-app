function generateVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => ("0" + b.toString(16)).slice(-2)).join("");
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

async function test() {
  const testVerifier = 'a95c4fad167b32682e80cce1e2ba9c756213fa3a999b741974f4b10834653a4b';
  const challenge = await sha256(testVerifier);
  console.log('Frontend challenge:', challenge);
}

test();
