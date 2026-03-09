const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "/login";
}

let currentUser = null;

function getAuthHeaders(includeJson = false) {
  const headers = {};

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (username) {
    headers["X-Username"] = username;
  }

  if (role) {
    headers["X-Role"] = role;
  }

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function logout() {
  currentUser = null;
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "/login";
}

function updateUIForRole() {
  const role = localStorage.getItem("role");

  const createIncidentSection = document.getElementById("createIncidentSection");
  const monitorSection = document.getElementById("monitorSection");
  const logSection = document.getElementById("logSection");
  const loginStatus = document.getElementById("login-status");

  if (role === "admin") {
    createIncidentSection.classList.remove("hidden");
    monitorSection.classList.remove("hidden");
    logSection.classList.remove("hidden");
  } else {
    createIncidentSection.classList.add("hidden");
    monitorSection.classList.add("hidden");
    logSection.classList.add("hidden");
  }

  const username = localStorage.getItem("username");
  if (username && role) {
    loginStatus.innerText = `Logged in as ${username} (${role})`;
  } else {
    loginStatus.innerText = "Not logged in";
  }
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("login-status");

  if (!username || !password) {
    status.innerText = "Please enter username and password";
    return;
  }

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!res.ok) {
      status.innerText = "Login failed";
      return;
    }

    const user = await res.json();
    currentUser = user;

    localStorage.setItem("username", user.username);
    localStorage.setItem("role", user.role);

    status.innerText = `Logged in as ${user.username} (${user.role})`;

    updateUIForRole();
    loadIncidents();
  } catch (error) {
    status.innerText = `Login error: ${error.message}`;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  updateUIForRole();
  loadIncidents();
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function loadHealth() {
  const box = document.getElementById("healthResult");
  box.innerHTML = "Loading...";

  try {
    const res = await fetch("/health");
    const data = await res.json();

    box.innerHTML = `
      <strong>Status:</strong> ${data.status}<br>
      <strong>Database:</strong> ${data.database}<br>
      <strong>Timestamp:</strong> ${data.timestamp}
    `;
  } catch (error) {
    box.innerHTML = `Error loading health: ${error.message}`;
  }
}

async function loadIncidents() {
  const container = document.getElementById("incidentsList");
  container.innerHTML = "Loading incidents...";

  try {
    const res = await fetch("/incidents/", {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `Error: ${data.detail || "Failed to load incidents"}`;
      return;
    }

    const incidents = data;
    const role = localStorage.getItem("role");

    if (!incidents.length) {
      container.innerHTML = "<p>No incidents found.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Service</th>
            <th>Created</th>
            <th>Resolved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const incident of incidents) {
      let actionsHtml = "-";

      if (role === "admin") {
        actionsHtml = `
          <button onclick="resolveIncident(${incident.id})">Resolve</button>
          <button onclick="deleteIncident(${incident.id})" class="danger">Delete</button>
        `;
      }

      html += `
        <tr>
          <td>${incident.id}</td>
          <td class="title-cell">${incident.title}</td>
          <td>${incident.status}</td>
          <td>${incident.priority}</td>
          <td class="service-cell">${incident.service}</td>
          <td class="date-cell">${formatDate(incident.created_at)}</td>
          <td class="date-cell">${formatDate(incident.resolved_at)}</td>
          <td class="actions-cell">${actionsHtml}</td>
        </tr>
      `;
    }

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `Error loading incidents: ${error.message}`;
  }
}

document.getElementById("incidentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const service = document.getElementById("service").value.trim();
  const priority = document.getElementById("priority").value;
  const message = document.getElementById("incidentMessage");

  try {
    const res = await fetch("/incidents/", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ title, service, priority })
    });

    const data = await res.json();

    if (!res.ok) {
      message.innerHTML = `Error: ${data.detail || JSON.stringify(data)}`;
      return;
    }

    message.innerHTML = `Incident created successfully: #${data.id} - ${data.title}`;
    document.getElementById("incidentForm").reset();
    loadIncidents();
  } catch (error) {
    message.innerHTML = `Error creating incident: ${error.message}`;
  }
});

async function resolveIncident(id) {
  try {
    const res = await fetch(`/incidents/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status: "resolved" })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Failed to resolve incident: ${data.detail || JSON.stringify(data)}`);
      return;
    }

    loadIncidents();
  } catch (error) {
    alert(`Error resolving incident: ${error.message}`);
  }
}

async function deleteIncident(id) {
  try {
    const res = await fetch(`/incidents/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Failed to delete incident: ${data.detail || JSON.stringify(data)}`);
      return;
    }

    loadIncidents();
  } catch (error) {
    alert(`Error deleting incident: ${error.message}`);
  }
}

document.getElementById("monitorForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("monitorName").value.trim();
  const url = document.getElementById("monitorUrl").value.trim();
  const result = document.getElementById("monitorResult");

  result.innerHTML = "Checking service...";

  try {
    const res = await fetch("/monitoring/check", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ name, url })
    });

    const data = await res.json();

    if (!res.ok) {
      result.innerHTML = `Error: ${data.detail || JSON.stringify(data)}`;
      return;
    }

    result.innerHTML = `
      <strong>Service:</strong> ${data.service}<br>
      <strong>URL:</strong> ${data.url}<br>
      <strong>Status:</strong> ${data.status}<br>
      <strong>Status code:</strong> ${data.status_code ?? "-"}<br>
      <strong>Latency:</strong> ${data.latency_ms ?? "-"} ms<br>
      <strong>Error:</strong> ${data.error ?? "-"}
    `;
  } catch (error) {
    result.innerHTML = `Error checking service: ${error.message}`;
  }
});

document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const content = document.getElementById("logContent").value;
  const result = document.getElementById("logResult");

  result.innerHTML = "Analyzing logs...";

  try {
    const res = await fetch("/logs/analyze", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (!res.ok) {
      result.innerHTML = `Error: ${data.detail || JSON.stringify(data)}`;
      return;
    }

    result.innerHTML = `
      <strong>Status:</strong> ${data.status}<br>
      <strong>Total lines:</strong> ${data.total_lines}<br>
      <strong>Errors:</strong> ${data.errors}<br>
      <strong>Warnings:</strong> ${data.warnings}<br>
      <strong>Timeouts:</strong> ${data.timeouts}<br>
      <strong>Auth failures:</strong> ${data.auth_failures}<br>
      <strong>Sample error lines:</strong>
      <pre>${JSON.stringify(data.error_lines, null, 2)}</pre>
    `;
  } catch (error) {
    result.innerHTML = `Error analyzing logs: ${error.message}`;
  }
});

updateUIForRole();
loadHealth();
loadIncidents();