document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    checkAuth();

    const memeContainer = document.getElementById('memeContainer');
    const loader = document.getElementById('loader');
    let isLoading = false;
    let after = null; // To keep track of the next page

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const loadMemes = async () => {
        if (isLoading) return;
        isLoading = true;
        loader.style.display = 'block';

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'loginpage.html';
                return;
            }

            // Get saved memes from backend
            const savedResponse = await fetch('http://localhost:5000/api/saves', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let savedMemes = [];
            if (savedResponse.ok) {
                const savedData = await savedResponse.json();
                savedMemes = savedData.saves || [];
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            let url = `https://www.reddit.com/r/memes.json?limit=10&random=${Math.random()}`;
            if (after) {
                url += `&after=${after}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            let memes = data.data.children.map(child => {
                const memeData = child.data;
                return {
                    url: memeData.url,
                    title: memeData.title,
                    author: memeData.author,
                    permalink: memeData.permalink,
                    created_utc: memeData.created_utc,
                    subreddit: memeData.subreddit,
                    post_hint: memeData.post_hint,
                    likes: 0,
                    liked: false
                };
            }).filter(meme => 
                meme.url && 
                (meme.url.endsWith('.jpg') || 
                 meme.url.endsWith('.png') || 
                 meme.url.endsWith('.gif') ||
                 meme.post_hint === 'image')
            );

            after = data.data.after;
            shuffleArray(memes);

            // Load saved likes and liked states
            const savedLikes = loadSavedLikes();
            memes.forEach(meme => {
                const savedLikeData = savedLikes[meme.url] || { count: 0, liked: false };
                meme.likes = savedLikeData.count;
                meme.liked = savedLikeData.liked;
            });

            memes.forEach(meme => {
                if (!memeContainer.querySelector(`img[src="${meme.url}"]`)) {
                    const memeElement = document.createElement('div');
                    memeElement.classList.add('meme');
                    memeElement.innerHTML = `
                        <div class="meme-header">
                            <h3>${meme.title || 'Untitled Meme'}</h3>
                            ${meme.author ? `<p>Posted by: ${meme.author}</p>` : ''}
                        </div>
                        <div class="meme-image">
                            <img src="${meme.url}" alt="${meme.title}">
                        </div>
                        <div class="meme-footer">
                            <div class="buttons">
                                <button class="save-btn"></button>
                                <button class="like-btn"></button>
                            </div>
                        </div>
                    `;

                    const img = memeElement.querySelector('img');
                    img.onload = () => {
                        memeContainer.appendChild(memeElement);
                    };
                    img.onerror = () => {
                        memeElement.remove();
                    };

                    // Add event listener to the save button
                    const saveButton = memeElement.querySelector('.save-btn');

                    // Initialize the save button with the saved state from backend
                    const isAlreadySaved = savedMemes.some(savedMeme => savedMeme.url === meme.url);
                    if (isAlreadySaved) {
                        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
                        saveButton.classList.add('saved');
                    } else {
                        saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
                    }

                    saveButton.addEventListener('click', () => {
                        toggleSaveMeme(meme, saveButton);
                    });

                    // Add event listener to the like button
                    const likeButton = memeElement.querySelector('.like-btn');
                    const likeCountElement = document.createElement('span');
                    likeCountElement.classList.add('like-count');
                    likeCountElement.textContent = meme.likes || 0;
                    likeButton.appendChild(likeCountElement);

                    if (meme.liked) {
                        likeButton.classList.add('liked');
                        likeButton.innerHTML = 'Liked ❤️ ';
                        likeButton.appendChild(likeCountElement);
                    } else {
                        likeButton.innerHTML = 'Like ';
                        likeButton.appendChild(likeCountElement);
                    }

                    likeButton.addEventListener('click', (e) => {
                        handleLikeButton(e.target, meme);
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching memes:', error);
            if (error.message.includes('authentication')) {
                window.location.href = 'loginpage.html';
            }
        } finally {
            isLoading = false;
            loader.style.display = 'none';
        }
    };

    const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadMemes();
        }
    };

    window.addEventListener('scroll', handleScroll);

    loadMemes();
});

const toggleSaveMeme = async (meme, button) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'loginpage.html';
        return;
    }

    try {
        // Check if the meme is already saved by checking the button state
        const isAlreadySaved = button.classList.contains('saved');

        if (isAlreadySaved) {
            // Get the index of the meme from the backend's saved memes
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
            const memeIndex = savedMemes.findIndex(savedMeme => savedMeme.url === meme.url);

            if (memeIndex !== -1) {
                // Remove the meme using the backend API
                const deleteResponse = await fetch(`http://localhost:5000/api/saves/${memeIndex}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (deleteResponse.ok) {
                    button.innerHTML = '<i class="fas fa-save"></i> Save';
                    button.classList.remove('saved');
                    showAlert('Meme unsaved successfully!');
                } else {
                    const errorData = await deleteResponse.json();
                    throw new Error(errorData.error || 'Failed to unsave meme');
                }
            }
        } else {
            // Save the meme using the backend API
            const saveResponse = await fetch('http://localhost:5000/api/saves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item: {
                        url: meme.url,
                        title: meme.title,
                        author: meme.author,
                        permalink: meme.permalink,
                        created_utc: meme.created_utc,
                        subreddit: meme.subreddit,
                        likes: meme.likes || 0,
                        liked: meme.liked || false
                    }
                })
            });

            if (saveResponse.ok) {
                button.innerHTML = '<i class="fas fa-check"></i> Saved';
                button.classList.add('saved');
                showAlert('Meme saved successfully!');
            } else {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || 'Failed to save meme');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message || 'Failed to save/unsave meme', true);
    }
};

const animateButton = (e) => {
    e.preventDefault();
    const button = e.target;
    // Reset animation
    button.classList.remove('animate');
    button.classList.add('animate');
    setTimeout(() => {
        button.classList.remove('animate');
        button.innerHTML = '😂'; // Change button text to laughing emoji
    }, 700);
};

function showAlert(message, isError = false) {
    let alertBox = document.createElement('div');
    alertBox.className = `alert ${isError ? 'error' : ''}`;
    alertBox.textContent = message;

    document.body.appendChild(alertBox);

    // Trigger reflow
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10);

    // Remove the alert after 3 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

// Example usage for the save button
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('save-button')) {
        // Logic to save the meme
        showAlert('Meme saved successfully!');
    }
});

// Function to handle like button animation, state, and count
const handleLikeButton = (button, meme) => {
    const likeCountElement = button.querySelector('.like-count');
    let likeCount = parseInt(likeCountElement.textContent, 10);

    // Toggle the liked state
    button.classList.toggle('liked');
    const isLiked = button.classList.contains('liked');

    if (isLiked) {
        likeCount += 1;
        button.innerHTML = 'Liked ❤️ '; // Update button text
    } else {
        likeCount -= 1;
        button.innerHTML = 'Like '; // Update button text
    }

    // Re-append the like count element to preserve it
    likeCountElement.textContent = likeCount;
    button.appendChild(likeCountElement);

    // Save the updated like count and liked state in localStorage
    saveLikeState(meme, likeCount, isLiked);
};

// Function to save the like count and liked state in localStorage
const saveLikeState = (meme, likeCount, isLiked) => {
    let savedLikes = JSON.parse(localStorage.getItem('likedMemes')) || {};

    // Update the like count and liked state for the specific meme
    savedLikes[meme.url] = { count: likeCount, liked: isLiked };
    localStorage.setItem('likedMemes', JSON.stringify(savedLikes));
};

// Function to load saved like counts and states
const loadSavedLikes = () => {
    return JSON.parse(localStorage.getItem('likedMemes')) || {};
};