// Function to handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email: `${username}@example.com`, // You might want to add an email field to your form
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'loginpage.html';
        } else {
            alert(data.error || 'Registration failed!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed! Please try again.');
    }
}

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store the token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            
            // Redirect to explore page
            window.location.href = 'explore.html';
        } else {
            alert(data.error || 'Login failed!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed! Please try again.');
    }
}

// Function to check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'loginpage.html';
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'loginpage.html';
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check authentication for protected pages
    if (window.location.pathname.includes('explore.html') || 
        window.location.pathname.includes('saves.html') ||
        window.location.pathname.includes('profile.html')) {
        checkAuth();
    }
}); 