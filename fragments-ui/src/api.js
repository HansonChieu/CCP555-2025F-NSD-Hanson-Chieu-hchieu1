// const apiUrl = process.env.API_URL || 'http://localhost:8080';

// export async function getUserFragments(user) {
//   const response = await fetch(`${apiUrl}/v1/fragments`, {
//     headers: user.authorizationHeaders(),
//   });
//   if (!response.ok) {
//     throw new Error(`Failed to get fragments: ${response.status}`);
//   }
//   return await response.json();
// }