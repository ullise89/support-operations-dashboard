async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const status = document.getElementById("login-status");

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

    localStorage.setItem("username", user.username);
    localStorage.setItem("role", user.role);

    window.location.href = "/";
}