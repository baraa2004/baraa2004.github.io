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
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'loginpage.html';
            return;
        }
        fetch('http://localhost:5000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            usernameInput.value = data.username;
            displayUsername.textContent = data.username;
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            showAlert('Failed to load profile', true);
        });
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

    // Load user memes from backend
    const loadUserMemes = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'loginpage.html';
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/saves', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load saved memes');
            }

            const data = await response.json();
            const userMemes = data.saves || [];
            
            memeContainer.innerHTML = '';
            if (userMemes.length === 0) {
                memeContainer.innerHTML = '<p class="no-memes">No memes posted yet!</p>';
                return;
            }

            userMemes.forEach((meme, index) => {
                const memeItem = document.createElement('div');
                memeItem.classList.add('meme-item');
                memeItem.innerHTML = `
                    <div class="meme-header">
                        <h3>${meme.title || 'Untitled Meme'}</h3>
                    </div>
                    <div class="meme-image">
                        <img src="${meme.url}" alt="${meme.title || 'Posted meme'}" 
                             onerror="this.onerror=null; this.src='../Data/error-image.png';">
                    </div>
                    <div class="meme-footer">
                        <button onclick="deleteMeme(${index})" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;
                memeContainer.appendChild(memeItem);
            });
        } catch (error) {
            console.error('Error loading memes:', error);
            showAlert('Failed to load memes', true);
        }
    };

    // Add new meme
    newMemeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('meme-title').value;
        const url = document.getElementById('meme-url').value;

        if (title && url) {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'loginpage.html';
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/saves', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        item: {
                            url: url,
                            title: title,
                            author: localStorage.getItem('username'),
                            created_utc: Math.floor(Date.now() / 1000),
                            likes: 0,
                            liked: false
                        }
                    })
                });

                if (response.ok) {
                    showAlert('Meme posted successfully!');
                    newMemeForm.reset();
                    loadUserMemes();
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to post meme');
                }
            } catch (error) {
                console.error('Error posting meme:', error);
                showAlert(error.message || 'Failed to post meme', true);
            }
        } else {
            showAlert('Please fill in both title and URL', true);
        }
    });

    // Delete meme
    window.deleteMeme = async (index) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'loginpage.html';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/saves/${index}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showAlert('Meme deleted successfully!');
                loadUserMemes();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete meme');
            }
        } catch (error) {
            console.error('Error deleting meme:', error);
            showAlert(error.message || 'Failed to delete meme', true);
        }
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

    function showAlert(message, isError = false) {
        let alertBox = document.createElement('div');
        alertBox.className = `alert ${isError ? 'error' : ''}`;
        alertBox.textContent = message;
    
        document.body.appendChild(alertBox);
    
        setTimeout(() => {
            alertBox.classList.add('show');
        }, 10);
    
        setTimeout(() => {
            alertBox.classList.remove('show');
            setTimeout(() => alertBox.remove(), 300);
        }, 3000);
    }

    // Load username and memes on page load
    loadUsername();
    loadUserMemes();
});