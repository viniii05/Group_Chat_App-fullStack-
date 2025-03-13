document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://3.7.55.51:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            console.log("Login successful!");
            alert('Logged in!!');

            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                console.error("Redirect URL missing in response");
                document.getElementById('error-message').innerText = "Redirect URL missing";
            }
        } else {
            document.getElementById('error-message').innerText = data.error || 'Something went wrong';
        }
    } catch (error) {
        document.getElementById('error-message').innerText = 'Error connecting to the server';
    }
});