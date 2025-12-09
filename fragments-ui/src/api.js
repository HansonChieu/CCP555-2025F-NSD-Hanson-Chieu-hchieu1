// src/api.js
 
// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'localhost:8080';
 
/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand=false) {
  console.log('Requesting user fragments data...');
  try {
    const fragmentsUrl = new URL('/v1/fragments', apiUrl);
     if (expand) {
      fragmentsUrl.searchParams.append('expand', '1');
    }
    const res = await fetch(fragmentsUrl, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Deletes a fragment by ID for the authenticated user.
 */
export async function deleteFragment(user, id) {
  console.log(`Deleting fragment ${id}...`);
  try {
    const url = `${apiUrl}/v1/fragments/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully deleted fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments/:id', { err });
    throw err; // Re-throw so the UI can handle the error
  }
}

/**
 * Updates a fragment's data.
 */
export async function updateFragment(user, id, newData) {
  console.log(`Updating fragment ${id}...`);
  try {
    const url = `${apiUrl}/v1/fragments/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        // We reuse the existing auth headers
        ...user.authorizationHeaders(),
        // We need to set the type, or let the browser set it? 
        // For text updates, usually text/plain is fine.
        // For simplicity in this assignment, we'll assume text updates for now.
        'Content-Type': 'text/plain', 
      },
      body: newData
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully updated fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments/:id', { err });
    throw err;
  }
}