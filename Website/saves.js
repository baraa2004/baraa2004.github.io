document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    checkAuth();

    const savedMemesContainer = document.getElementById('savedMemesContainer');
    loadSavedMemes();

    async function loadSavedMemes() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'loginpage.html';
                return;
            }

            const response = await fetch('http://localhost:5000/api/saves', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved memes');
            }

            const data = await response.json();
            const savedMemes = data.saves || [];

            if (savedMemes.length === 0) {
                savedMemesContainer.innerHTML = '<p class="no-memes">No saved memes yet! Go to Explore to find and save some memes.</p>';
                return;
            }

            savedMemesContainer.innerHTML = '';
            savedMemes.forEach((meme, index) => {
                if (!meme || !meme.url) {
                    console.error('Invalid meme data:', meme);
                    return;
                }

                const memeElement = document.createElement('div');
                memeElement.classList.add('meme');
                
                // Create the meme content
                const memeContent = `
                    <div class="meme-header">
                        <h3>${meme.title || 'Untitled Meme'}</h3>
                        ${meme.author ? `<p>Posted by: ${meme.author}</p>` : ''}
                    </div>
                    <div class="meme-image">
                        <img src="${meme.url}" alt="${meme.title || 'Saved meme'}" 
                             onerror="this.onerror=null; this.src='../Data/error-image.png';">
                    </div>
                    <div class="meme-footer">
                        <div class="meme-stats">
                            <span class="likes">❤️ ${meme.likes || 0} likes</span>
                            ${meme.created_utc ? `<span class="date">📅 ${new Date(meme.created_utc * 1000).toLocaleDateString()}</span>` : ''}
                        </div>
                        <div class="buttons">
                            <button class="unsave-btn" data-index="${index}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            ${meme.permalink ? 
                                `<a href="https://reddit.com${meme.permalink}" target="_blank" class="source-btn">
                                    <i class="fas fa-external-link-alt"></i> View Source
                                </a>` : ''
                            }
                        </div>
                    </div>
                `;

                memeElement.innerHTML = memeContent;

                // Add event listener to the unsave button
                const unsaveButton = memeElement.querySelector('.unsave-btn');
                unsaveButton.addEventListener('click', () => removeSavedMeme(index));

                savedMemesContainer.appendChild(memeElement);
            });
        } catch (error) {
            console.error('Error loading saved memes:', error);
            if (error.message.includes('authentication')) {
                window.location.href = 'loginpage.html';
            } else {
                showAlert('Failed to load saved memes', true);
            }
        }
    }

    async function removeSavedMeme(index) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'loginpage.html';
                return;
            }

            const response = await fetch(`http://localhost:5000/api/saves/${index}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showAlert('Meme removed successfully');
                loadSavedMemes(); // Reload the saved memes
            } else {
                const data = await response.json();
                showAlert(data.error || 'Failed to remove meme', true);
            }
        } catch (error) {
            console.error('Error removing saved meme:', error);
            showAlert('Failed to remove meme', true);
        }
    }

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
});