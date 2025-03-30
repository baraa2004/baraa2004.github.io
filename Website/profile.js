document.addEventListener('DOMContentLoaded', () => {
    const memeContainer = document.getElementById('meme-container');
    const newMemeForm = document.getElementById('new-meme-form');
    const usernameInput = document.getElementById('username');
    const displayUsername = document.getElementById('display-username');
    const saveButton = document.querySelector('.save-btn');
    const deleteAccountButton = document.getElementById('delete-account');
    const passwordInput = document.getElementById('password');

    async function loadProfile() {
        const res = await fetch('get_memes.php');
        const memes = await res.json();
        memeContainer.innerHTML = '';
        memes.forEach((meme, index) => {
            const div = document.createElement('div');
            div.className = 'meme-item';
            div.innerHTML = `<img src="${meme.url}" alt="${meme.title}">
                             <p>${meme.title}</p>`;
            memeContainer.appendChild(div);
        });
    }

    newMemeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('meme-title').value;
        const url = document.getElementById('meme-url').value;
        const res = await fetch('add_meme.php', {
            method: 'POST',
            body: new URLSearchParams({ title, url })
        });
        const data = await res.json();
        if (data.success) {
            loadProfile();
            newMemeForm.reset();
        }
    });

    saveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;
        const res = await fetch('save_profile.php', {
            method: 'POST',
            body: new URLSearchParams({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            displayUsername.textContent = username;
            alert('Profile updated!');
        }
    });

    deleteAccountButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete your account?')) {
            const res = await fetch('delete_account.php', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Account deleted.');
                window.location.href = 'loginpage.html';
            }
        }
    });

    loadProfile();
});