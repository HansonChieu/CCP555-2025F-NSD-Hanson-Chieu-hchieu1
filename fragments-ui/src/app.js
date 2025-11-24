// app.js
import { signIn, getUser, signOut } from './auth.js';
import { getUserFragments } from './api.js';

async function displayFragments(user) {
  const fragmentsListDiv = document.querySelector('#fragmentsList');
  const fragmentsResultDiv = document.querySelector('#fragmentsResult');
  
  try {
    // Get fragments with expand=1 to get full metadata
    const data = await getUserFragments(user, true);
    
    if (!data || !data.fragments || data.fragments.length === 0) {
      fragmentsListDiv.innerHTML = '<p>No fragments yet. Create one above!</p>';
      return;
    }
    
    // Create table to display fragments
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Size</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${data.fragments.map(fragment => `
          <tr>
            <td class="fragment-id">${fragment.id}</td>
            <td>${fragment.type}</td>
            <td>${fragment.size} bytes</td>
            <td>${new Date(fragment.created).toLocaleString()}</td>
            <td>${new Date(fragment.updated).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    fragmentsListDiv.innerHTML = '';
    fragmentsListDiv.appendChild(table);
    
    fragmentsResultDiv.innerHTML = `<div class="result success">Found ${data.fragments.length} fragment(s)</div>`;
    
  } catch (error) {
    console.error('Failed to display fragments:', error);
    fragmentsResultDiv.innerHTML = `<div class="result error">Failed to load fragments: ${error.message}</div>`;
  }
}

async function init() {
  const loginSection = document.querySelector('#loginSection');
  const userSection = document.querySelector('#userSection');
  const loginBtn = document.querySelector('#login');
  const usernameSpan = document.querySelector('#username');

  const user = await getUser();

  if (user) {
    // --- Logged-in state ---
    console.log('User is logged in:', user.username);
    
    // Show user section, hide login
    loginSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    usernameSpan.textContent = user.username;

    // Load and display fragments
    await displayFragments(user);

    // --- Refresh fragments button ---
    const refreshBtn = document.querySelector('#refreshFragments');
    refreshBtn.addEventListener('click', async () => {
      await displayFragments(user);
    });

    // --- Logout button ---
    const logoutBtn = document.querySelector('#logout');
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Logout failed:', error);
        alert(`Logout failed: ${error.message}`);
      }
    });

    // --- Handle fragment creation ---
    const fragmentForm = document.querySelector('#fragmentForm');
    const createResultDiv = document.querySelector('#createResult');
    
    fragmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const type = document.getElementById('fragmentType').value;
      const content = document.getElementById('fragmentContent').value;

      if (!content.trim()) {
        createResultDiv.innerHTML = '<div class="result error"> Please enter some content</div>';
        return;
      }

      try {
        createResultDiv.innerHTML = '<div class="result info">Creating fragment...</div>';
        
        // Use process.env.API_URL with fallback
        const API_URL = process.env.API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${API_URL}/v1/fragments`, {
          method: 'POST',
          headers: {
            'Content-Type': type,
            'Authorization': `Bearer ${user.idToken}`
          },
          body: content
        });

        const data = await response.json();
        
        // Capture the Location header for the screenshot requirement!
        const locationHeader = response.headers.get('Location');

        if (response.ok) {
          createResultDiv.innerHTML = `
            <div class="result success">
               Fragment created successfully!<br>
              <strong>ID:</strong> <span class="fragment-id">${data.fragment.id}</span><br>
              <strong>Type:</strong> ${data.fragment.type}<br>
              <strong>Size:</strong> ${data.fragment.size} bytes<br>
              ${locationHeader ? `<strong>Location:</strong> <div class="location-header">${locationHeader}</div>` : ''}
            </div>
          `;
          
          console.log('Fragment created:', data);
          console.log('Location header:', locationHeader);

          // Clear the form
          document.getElementById('fragmentContent').value = '';

          // Refresh the fragments list
          await displayFragments(user);

        } else {
          createResultDiv.innerHTML = `<div class="result error"> ${data.error?.message || 'Failed to create fragment'}</div>`;
        }
      } catch (err) {
        console.error('Fragment creation error:', err);
        createResultDiv.innerHTML = `<div class="result error"> Error: ${err.message}</div>`;
      }
    });

  } else {
    // --- Logged-out state ---
    console.log('User is not logged in');
    loginSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    
    loginBtn.addEventListener('click', () => {
      try {
        signIn();
      } catch (error) {
        console.error('Sign-in failed:', error);
        alert(`Sign-in failed: ${error.message}`);
      }
    });
  }
}

// Initialize the app when DOM is ready
addEventListener('DOMContentLoaded', init);