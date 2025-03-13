document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phonenumber = document.getElementById('phonenumber').value;
    const password = document.getElementById('password').value;

    const user = { name, email, phonenumber, password };

    try {
        const response = await fetch('http://3.7.55.51:3000/signup', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const data = await response.json();

        if (response.ok) {
            alert('User signed up successfully!');
        } else {
            document.getElementById('error-message').innerText = data.error || 'Something went wrong';
        }
    } catch (error) {
        document.getElementById('error-message').innerText = 'Error connecting to the server';
    }
});

