document.addEventListener('DOMContentLoaded', () => {
    const memeContainer = document.getElementById('meme-container');
    const newMemeForm = document.getElementById('new-meme-form');
    const passwordForm = document.getElementById('password-form');
    const deleteAccountButton = document.getElementById('delete-account');
    const logoutButton = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('username');
    const displayUsername = document.getElementById('display-username');
    const saveButton = document.querySelector('.save-btn'); // Save button

    // Load username from localStorage
    const loadUsername = () => {
        const savedUsername = localStorage.getItem('username') || 'bv4ts'; // Default to "bv4ts" if no username is saved
        usernameInput.value = savedUsername; // Set the input field value
        displayUsername.textContent = savedUsername; // Update the displayed username
    };

    // Save username to localStorage when Save button is clicked
    saveButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        const newUsername = usernameInput.value.trim(); // Get the trimmed input value
        if (newUsername) {
            displayUsername.textContent = newUsername; // Update the displayed username
            localStorage.setItem('username', newUsername); // Save the username to localStorage
            alert('Username saved successfully!');
        } else {
            alert('Please enter a valid username.');
        }
    });

    // Load user memes from localStorage
    const loadUserMemes = () => {
        const userMemes = JSON.parse(localStorage.getItem('userMemes')) || [];
        memeContainer.innerHTML = '';
        userMemes.forEach((meme, index) => {
            const memeItem = document.createElement('div');
            memeItem.classList.add('meme-item');
            memeItem.innerHTML = `
                <img src="${meme.url}" alt="${meme.title}">
                <p>${meme.title}</p>
                <button onclick="deleteMeme(${index})">Delete</button>
            `;
            memeContainer.appendChild(memeItem);
        });
    };

    // Add new meme
    newMemeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('meme-title').value;
        const url = document.getElementById('meme-url').value;

        if (title && url) {
            const userMemes = JSON.parse(localStorage.getItem('userMemes')) || [];
            userMemes.push({ title, url });
            localStorage.setItem('userMemes', JSON.stringify(userMemes));
            loadUserMemes();
            newMemeForm.reset();
        }
    });

    // Delete meme
    window.deleteMeme = (index) => {
        const userMemes = JSON.parse(localStorage.getItem('userMemes')) || [];
        userMemes.splice(index, 1);
        localStorage.setItem('userMemes', JSON.stringify(userMemes));
        loadUserMemes();
    };

    // Change password
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('password').value;
        if (newPassword) {
            localStorage.setItem('userPassword', newPassword);
            alert('Password changed successfully!');
            passwordForm.reset();
        }
    });

    // Delete account
    deleteAccountButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            localStorage.clear();
            alert('Account deleted successfully!');
            window.location.href = 'loginpage.html';
        }
    });

    // Logout button functionality
    logoutButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            // Clear any session-related data (if applicable)
            localStorage.removeItem('userSession'); // Example: Clear user session data
            window.location.href = 'loginpage.html'; // Redirect to the login page
        }
    });

    // Load username and memes on page load
    loadUsername();
    loadUserMemes();
});