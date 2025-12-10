// src/app.js
import { signIn, getUser, signOut } from './auth.js';
import { getUserFragments, deleteFragment, updateFragment, getFragmentData } from './api.js';

async function displayFragments(user) {
  const fragmentsListDiv = document.querySelector('#fragmentsList');
  const fragmentsResultDiv = document.querySelector('#fragmentsResult');

  try {
    const data = await getUserFragments(user, true);

    if (!data || !data.fragments || data.fragments.length === 0) {
      fragmentsListDiv.innerHTML = '<p>No fragments yet. Create one above!</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Size</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
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
            <td>
              <button class="convert-btn" data-id="${fragment.id}">Convert</button>
              <button class="update-btn" data-id="${fragment.id}" data-type="${fragment.type}">Update</button>
              <button class="delete-btn" data-id="${fragment.id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    fragmentsListDiv.innerHTML = '';
    fragmentsListDiv.appendChild(table);

    // Attach DELETE Listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this fragment?')) {
          try {
            await deleteFragment(user, id);
            await displayFragments(user);
          } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete fragment');
          }
        }
      });
    });

    // Attach UPDATE Listeners
    document.querySelectorAll('.update-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type; // Get the type from the button
        
        const newContent = prompt(`Enter new content for this fragment (${type}):`);
        
        if (newContent !== null) {
          try {
            // Pass the type to the API function
            await updateFragment(user, id, newContent, type);
            await displayFragments(user);
          } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update fragment: ' + err.message);
          }
        }
      });
    });

    document.querySelectorAll('.convert-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        // Ask user what extension they want
        const ext = prompt("What extension do you want? (e.g., .html, .jpg, .txt)");
        
        if (ext) {
          try {
            // 1. Fetch the converted data
            const blob = await getFragmentData(user, id, ext);
            
            // 2. Create a temporary URL for the Blob
            const url = URL.createObjectURL(blob);
            
            // 3. Open it in a new tab
            window.open(url, '_blank');
            
          } catch (err) {
            console.error('Conversion failed', err);
            alert('Failed to convert/view fragment: ' + err.message);
          }
        }
      });
    });

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
  
  // Input selectors
  const fragmentType = document.getElementById('fragmentType');
  const textInputGroup = document.getElementById('textInputGroup');
  const fileInputGroup = document.getElementById('fileInputGroup');
  const fragmentFile = document.getElementById('fragmentFile');
  const fragmentContent = document.getElementById('fragmentContent');

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

    // --- Toggle Input Fields based on Type ---
    // Moved OUTSIDE the refresh button listener to avoid duplicates
    fragmentType.addEventListener('change', () => {
      const type = fragmentType.value;
      if (type.startsWith('image/')) {
        textInputGroup.classList.add('hidden');
        fileInputGroup.classList.remove('hidden');
        // Disable text requirement, enable file check
        fragmentContent.required = false; 
      } else {
        textInputGroup.classList.remove('hidden');
        fileInputGroup.classList.add('hidden');
        fragmentContent.required = true;
      }
    });

    // --- Handle fragment creation ---
    const fragmentForm = document.querySelector('#fragmentForm');
    const createResultDiv = document.querySelector('#createResult');
    
    fragmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const type = fragmentType.value;
      let bodyData;

      // Logic to determine if we are sending text or a file
      if (type.startsWith('image/')) {
        if (!fragmentFile.files || fragmentFile.files.length === 0) {
          createResultDiv.innerHTML = '<div class="result error">Please select a file</div>';
          return;
        }
        // For images, we send the file object directly
        bodyData = fragmentFile.files[0]; 
      } else {
        const content = fragmentContent.value;
        if (!content.trim()) {
          createResultDiv.innerHTML = '<div class="result error">Please enter some content</div>';
          return;
        }
        bodyData = content;
      }

      try {
        createResultDiv.innerHTML = '<div class="result info">Creating fragment...</div>';
        
        const API_URL = process.env.API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${API_URL}/v1/fragments`, {
          method: 'POST',
          headers: {
            'Content-Type': type,
            'Authorization': `Bearer ${user.idToken}`
          },
          body: bodyData // Use bodyData, not content
        });

        const data = await response.json();
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

          // Clear the form inputs
          document.getElementById('fragmentContent').value = '';
          document.getElementById('fragmentFile').value = '';

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