// This script handles all shared frontend logic including:
// - Loading header and footer components
// - Populating homepage stats and leaderboards
// - Complex dynamic logic for the registration form
// - Full functionality for the admin panel (login, logout, data management, exports)

document.addEventListener('DOMContentLoaded', function() {

  // --- SHARED COMPONENT & DYNAMIC CONTENT LOGIC ---
  const loadComponent = (url, placeholderId, callback) => {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return response.text();
      })
      .then(data => {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
          placeholder.innerHTML = data;
          if (callback) callback();
        }
      })
      .catch(error => console.error(`Error loading ${placeholderId}:`, error));
  };

  const setDynamicYear = () => {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  };

  loadComponent('/templates/header.html', 'header-placeholder');
  loadComponent('/templates/footer.html', 'footer-placeholder', setDynamicYear);


  // --- HOME PAGE LOGIC ---
  const registrationsCount = document.getElementById('registrations-count');
  const seatsLeftCount = document.getElementById('seats-left-count');
  if (registrationsCount && seatsLeftCount) {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        registrationsCount.textContent = data.registeredCount;
        seatsLeftCount.textContent = data.seatsLeft;
      })
      .catch(err => console.error('Failed to load stats:', err));
  }
  
  // --- LEADERBOARD PAGE LOGIC ---
  const leaderboardList = document.getElementById('leaderboard-list');
  if (leaderboardList) {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        const topThree = data.slice(0, 3);
        if (topThree.length > 0) {
            leaderboardList.innerHTML = topThree.map((player, index) => {
                 const rankClasses = [
                    'border-yellow-400', // Gold
                    'border-gray-400', // Silver
                    'border-orange-500' // Bronze
                ];
                const textClasses = [
                    'text-4xl',
                    'text-3xl',
                    'text-2xl'
                ];
                return `
                    <li class="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center border-4 ${rankClasses[index]}">
                        <div class="font-bold ${textClasses[index]} text-gray-800">${player.name}</div>
                        <div class="text-xl text-gray-600 mt-2">${player.points} Points</div>
                    </li>
                `;
            }).join('');
        } else {
             leaderboardList.innerHTML = '<p class="text-center text-gray-600 col-span-full">No leaderboard data available yet.</p>';
        }
      })
      .catch(err => console.error('Failed to load leaderboard:', err));
  }


  // --- REGISTRATION PAGE LOGIC ---
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    const yearSelect = document.getElementById('year');
    const courseSelect = document.getElementById('course');
    const sectionSelect = document.getElementById('section');
    const paymentScreenshotInput = document.getElementById('paymentScreenshot');
    const fileNameSpan = document.getElementById('file-name');

    const updateSections = () => {
      const year = yearSelect.value;
      const course = courseSelect.value;
      let options = ['<option value="" disabled selected>Select Section</option>'];

      if (year === '1') {
        if (course === 'Computer Science and Engineering (Data Science)') options.push('<option value="A">A</option>', '<option value="B">B</option>');
        else if (course === 'Computer Engineering') options.push('<option value="C">C</option>', '<option value="D">D</option>');
      } else if (year === '2') {
        if (course === 'Computer Science and Engineering (Data Science)') options.push('<option value="A">A</option>', '<option value="B">B</option>');
        else if (course === 'Computer Engineering') options.push('<option value="C">C</option>');
      } else if (year === '3' || year === '4') {
        options.push('<option value="No Section">No Section</option>');
      }

      sectionSelect.innerHTML = options.join('');
    };

    const updateCourses = () => {
        const year = yearSelect.value;
        const courseCE = courseSelect.querySelector('option[value="Computer Engineering"]');
        if (courseCE) {
             if (year === '4') {
                if(courseSelect.value === 'Computer Engineering') courseSelect.value = '';
                courseCE.style.display = 'none';
            } else {
                courseCE.style.display = 'block';
            }
        }
        updateSections();
    };
    
    yearSelect.addEventListener('change', updateCourses);
    courseSelect.addEventListener('change', updateSections);
    
    // Check if paymentScreenshotInput exists before adding event listener
    if(paymentScreenshotInput) {
        paymentScreenshotInput.addEventListener('change', () => {
          if(fileNameSpan) {
            fileNameSpan.textContent = paymentScreenshotInput.files[0] ? paymentScreenshotInput.files[0].name : 'No file chosen';
          }
        });
    }

    registrationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const messageDiv = document.getElementById('message');
      const formData = new FormData(this);
      
      messageDiv.textContent = 'Submitting...';
      messageDiv.className = 'text-center font-medium text-blue-600 mt-4';

      fetch('/api/register', {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        // First, check if the response is successful (status 200-299)
        // If not, we'll handle it as an error
        if (!response.ok) {
            // Get the error message from the response body (as text)
            return response.text().then(text => {
                // Try to parse it as JSON, but fall back to plain text
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'An unknown error occurred.');
                } catch {
                    throw new Error(text || `Server responded with status: ${response.status}`);
                }
            });
        }
        // If the response is OK, then we can safely parse it as JSON
        return response.json();
      })
      .then(data => {
        // This part will only run if the response was successful
        if (data.success) {
          messageDiv.textContent = 'Registration successful!';
          messageDiv.className = 'text-center font-medium text-green-600 mt-4';
          registrationForm.reset();
          if(fileNameSpan) {
            fileNameSpan.textContent = 'No file chosen';
          }
        } else {
          // This handles cases where the server returns a 200 OK status
          // but indicates failure in the JSON body (e.g., { success: false, ... })
          messageDiv.textContent = `Error: ${data.message}`;
          messageDiv.className = 'text-center font-medium text-red-600 mt-4';
        }
      })
      .catch(error => {
        // This will catch network errors and the errors we threw manually above
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.className = 'text-center font-medium text-red-600 mt-4';
        console.error('Submission Error:', error);
      });
    });

    updateCourses(); // Initial call
  }

  // --- ADMIN PAGE LOGIC ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const messageP = document.getElementById('login-message');
        messageP.textContent = ''; // Clear previous messages

        fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Invalid credentials');
            return res.json();
        })
        .then(data => {
            if(data.token) {
                localStorage.setItem('admin-token', data.token);
                document.getElementById('login-section').classList.add('hidden');
                document.getElementById('admin-content').classList.remove('hidden');
                loadAdminData(data.token);
            }
        })
        .catch(err => {
            messageP.textContent = err.message || 'An error occurred during login.';
            console.error(err);
        });
    });
    
    const token = localStorage.getItem('admin-token');
    if (token) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-content').classList.remove('hidden');
        loadAdminData(token);
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('admin-token');
            location.reload();
        });
    }
    
    const exportRegButton = document.getElementById('export-registrations');
    if(exportRegButton) {
        exportRegButton.addEventListener('click', () => exportData('registrations'));
    }
    
    const exportLeadButton = document.getElementById('export-leaderboard');
    if(exportLeadButton) {
        exportLeadButton.addEventListener('click', () => exportData('leaderboard'));
    }
  }
});


// --- ADMIN HELPER FUNCTIONS ---
function loadAdminData(token) {
  // Fetch registrations
  fetch('/api/admin/registrations', { headers: { 'Authorization': `Bearer ${token}` }})
  .then(res => res.json())
  .then(data => {
      const tableBody = document.getElementById('registrations-table-body');
      if (!tableBody) return;
      tableBody.innerHTML = '';
      data.forEach(reg => {
          const row = `
              <tr>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.sapId}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.email}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.year}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.course}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${reg.section}</td>
                  <td class="px-6 py-4 whitespace-nowrap"><a href="${reg.paymentScreenshotPath}" target="_blank" class="text-blue-600 hover:underline">View</a></td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="deleteUser('${reg._id}')" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                  </td>
              </tr>`;
          tableBody.innerHTML += row;
      });
  });
  
  // Fetch leaderboard data
  fetch('/api/leaderboard', { headers: { 'Authorization': `Bearer ${token}` }})
  .then(res => res.json())
  .then(data => {
      const tableBody = document.getElementById('leaderboard-manage-body');
      if (!tableBody) return;
      tableBody.innerHTML = '';
      data.forEach(player => {
          const row = `
              <tr>
                  <td class="px-6 py-4 whitespace-nowrap">${player.name || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${player.points}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <input type="number" id="points-${player.registrationId}" class="w-24 border-gray-300 rounded-md shadow-sm p-1">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <button onclick="updatePoints('${player.registrationId}')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Update</button>
                  </td>
              </tr>`;
          tableBody.innerHTML += row;
      });
  });
}

function updatePoints(registrationId) {
  const token = localStorage.getItem('admin-token');
  const pointsInput = document.getElementById(`points-${registrationId}`);
  const points = pointsInput.value;

  if (!points || !Number.isInteger(Number(points))) {
      alert('Please enter a valid whole number for points.');
      return;
  }

  fetch('/api/admin/leaderboard', {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ registrationId, pointsToAdd: parseInt(points, 10) })
  })
  .then(res => res.json())
  .then(data => {
      if (data.success) {
          alert('Points updated successfully!');
          pointsInput.value = '';
          loadAdminData(token);
      } else {
          alert('Error: ' + data.message);
      }
  })
  .catch(err => {
      alert('An error occurred.');
      console.error(err);
  });
}

function deleteUser(registrationId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    const token = localStorage.getItem('admin-token');
    fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('User deleted successfully!');
            loadAdminData(token); // Refresh the tables
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        alert('An error occurred while deleting the user.');
        console.error(err);
    });
}

function exportData(type) {
  const token = localStorage.getItem('admin-token');
  const url = `/api/admin/export/${type}`;
  fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(response => {
          if (!response.ok) throw new Error('Network response was not ok.');
          const filename = type === 'registrations' ? 'registrations.xlsx' : 'leaderboard.xlsx';
          return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          a.remove();
      })
      .catch(error => {
          console.error(`Error exporting ${type}:`, error);
          alert(`Failed to export ${type}.`);
      });
}