document.addEventListener('DOMContentLoaded', () => {
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
        loader.style.display = 'block'; // Show the loader

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Add a 1-second delay

            let url = `https://www.reddit.com/r/memes.json?limit=10&random=${Math.random()}`;
            if (after) {
                url += `&after=${after}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            let memes = data.data.children.map(child => child.data);
            after = data.data.after; // Update the after parameter

            shuffleArray(memes); // Shuffle the memes array

            // Load saved likes and liked states when loading memes
            const savedLikes = loadSavedLikes();
            memes.forEach(meme => {
                const savedLikeData = savedLikes[meme.url] || { count: 0, liked: false };
                meme.likes = savedLikeData.count; // Attach saved like count to the meme object
                meme.liked = savedLikeData.liked; // Attach saved liked state to the meme object
            });

            // Load saved memes from localStorage
            const savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];

            
            memes.forEach(meme => {
                if (!memeContainer.querySelector(`img[src="${meme.url}"]`)) {
                    const memeElement = document.createElement('div');
                    memeElement.classList.add('meme');
                    memeElement.innerHTML = `
                        <img src="${meme.url}" alt="${meme.title}">
                        <div class="buttons">
                            <button class="save-btn"></button>
                            <button class="like-btn"></button>
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

                    // Initialize the save button with the saved state
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
                    likeCountElement.textContent = meme.likes || 0; // Initialize with saved likes or 0
                    likeButton.appendChild(likeCountElement);

                    // Initialize the like button with the saved liked state
                    if (meme.liked) {
                        likeButton.classList.add('liked');
                        likeButton.innerHTML = 'Liked ❤️ ';
                        likeButton.appendChild(likeCountElement); // Ensure the counter is appended
                    } else {
                        likeButton.innerHTML = 'Like ';
                        likeButton.appendChild(likeCountElement); // Ensure the counter is appended
                    }

                    likeButton.addEventListener('click', (e) => {
                        handleLikeButton(e.target, meme);
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching memes:', error);
        } finally {
            isLoading = false;
            loader.style.display = 'none'; // Hide the loader
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

const saveMeme = (meme, button) => {
    let savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];

    // Check if the meme is already saved
    const isAlreadySaved = savedMemes.some(savedMeme => savedMeme.url === meme.url);
    if (isAlreadySaved) {
        showAlert('Meme is already saved!', true); // Show an error alert
        return;
    }

    // Save the meme
    savedMemes.push(meme);
    localStorage.setItem('savedMemes', JSON.stringify(savedMemes));

    // Update button text and style
    button.textContent = 'Saved';
    button.classList.add('saved');

    showAlert('Meme saved successfully!');
};

const toggleSaveMeme = (meme, button) => {
    let savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];

    // Check if the meme is already saved
    const isAlreadySaved = savedMemes.some(savedMeme => savedMeme.url === meme.url);

    if (isAlreadySaved) {
        // Unsave the meme
        savedMemes = savedMemes.filter(savedMeme => savedMeme.url !== meme.url);
        localStorage.setItem('savedMemes', JSON.stringify(savedMemes));

        // Update button text, icon, and style
        button.innerHTML = '<i class="fas fa-save"></i> Save';
        button.classList.remove('saved');

        showAlert('Meme unsaved successfully!');
    } else {
        // Save the meme
        savedMemes.push(meme);
        localStorage.setItem('savedMemes', JSON.stringify(savedMemes));

        // Update button text, icon, and style
        button.innerHTML = '<i class="fas fa-check"></i> Saved';
        button.classList.add('saved');

        showAlert('Meme saved successfully!');
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

    // Show the alert
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10);

    // Hide the alert after 3 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => alertBox.remove(), 300); // Remove the element after transition
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