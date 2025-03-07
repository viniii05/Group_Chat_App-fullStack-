document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = data.redirect; // Redirect user to "/"
        } else {
            document.getElementById('error-message').innerText = data.error || 'Something went wrong';
        }
    } catch (error) {
        document.getElementById('error-message').innerText = 'Error connecting to the server';
    }
});
