// admin-auth.js
// Handles admin login and page protection

function requireAdmin() {
  const token = localStorage.getItem('adminToken');
  if (token !== 'admin-token') {
    showAdminLogin();
    return false;
  }
  return true;
}

function showAdminLogin() {
  let loginDiv = document.getElementById('adminLoginDiv');
  if (!loginDiv) {
    loginDiv = document.createElement('div');
    loginDiv.id = 'adminLoginDiv';
    loginDiv.style.position = 'fixed';
    loginDiv.style.top = '0';
    loginDiv.style.left = '0';
    loginDiv.style.width = '100vw';
    loginDiv.style.height = '100vh';
    loginDiv.style.background = 'rgba(0,0,0,0.2)';
    loginDiv.style.zIndex = '99999';
    loginDiv.style.display = 'flex';
    loginDiv.style.alignItems = 'center';
    loginDiv.style.justifyContent = 'center';
    loginDiv.innerHTML = `
      <div style="background:#fff;padding:2em 2.5em;border-radius:16px;box-shadow:0 8px 32px rgba(44,44,120,0.12);text-align:center;min-width:320px;">
        <h2 style="color:#2d2d7a;">Admin Login</h2>
        <input type="password" id="adminPasswordInput" placeholder="Enter admin password" style="padding:0.7em;border-radius:8px;border:1px solid #ccc;width:80%;margin-top:1em;margin-bottom:1em;font-size:1em;" />
        <br>
        <button id="adminLoginBtn" style="margin-top:1em;padding:0.6em 1.5em;border-radius:8px;border:none;background:#2d2d7a;color:#fff;font-weight:600;cursor:pointer;">Login</button>
        <div id="adminLoginError" style="color:red;margin-top:1em;"></div>
      </div>
    `;
    document.body.appendChild(loginDiv);
    document.getElementById('adminLoginBtn').onclick = function() {
      const pw = document.getElementById('adminPasswordInput').value;
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token === 'admin-token') {
          localStorage.setItem('adminToken', data.token);
          loginDiv.remove();
          location.reload();
        } else {
          document.getElementById('adminLoginError').textContent = data.error || 'Login failed';
        }
      })
      .catch(() => {
        document.getElementById('adminLoginError').textContent = 'Login failed';
      });
    };
  }
}

// Call requireAdmin() on page load for protected pages
