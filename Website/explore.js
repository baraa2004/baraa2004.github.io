
document.addEventListener('DOMContentLoaded', () => {
    console.log('explore.js loaded');

    const memeContainer = document.getElementById('memeContainer');
    const loader = document.getElementById('loader');
    let isLoading = false;
    let after = null;
    let savedMemes = [];

    const fetchSavedMemes = async () => {
        try {
            const res = await fetch('get_saved_memes.php');
            savedMemes = await res.json();
            console.log("Saved memes:", savedMemes);
        } catch (error) {
            console.error('Failed to fetch saved memes:', error);
            savedMemes = [];
        }
    };

    const isMemeSaved = (url) => savedMemes.includes(url);

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
            await new Promise(resolve => setTimeout(resolve, 1000));
            let url = `https://www.reddit.com/r/memes.json?limit=10&random=${Math.random()}`;
            if (after) url += `&after=${after}`;

            const response = await fetch(url);
            const data = await response.json();
            let memes = data.data.children.map(child => child.data);
            after = data.data.after;
            shuffleArray(memes);

            memes.forEach(meme => {
                console.log("Handling meme:", meme.url);

                // ✅ Filter only valid direct image links
                if (!meme.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    console.log("Skipping non-image URL:", meme.url);
                    return;
                }

                if (!memeContainer.querySelector(`img[src="${meme.url}"]`)) {
                    const isSaved = isMemeSaved(meme.url);
                    const memeElement = document.createElement('div');
                    memeElement.classList.add('meme');
                    memeElement.innerHTML = `
                        <img src="${meme.url}" alt="${meme.title}">
                        <div class="buttons">
                            <button class="save-btn ${isSaved ? 'saved' : ''}">
                                <i class="fas ${isSaved ? 'fa-check' : 'fa-save'}"></i> ${isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    `;
                    const img = memeElement.querySelector('img');
                    img.onload = () => {
                        memeContainer.appendChild(memeElement);
                        console.log("Meme loaded and added:", meme.url);

                        const saveButton = memeElement.querySelector('.save-btn');
                        if (saveButton) {
                            saveButton.addEventListener('click', () => {
                                console.log("Clicked Save button for meme:", meme.url);
                                toggleSaveMeme(meme, saveButton);
                            });
                        }
                    };
                    img.onerror = () => memeElement.remove();
                }
            });
        } catch (error) {
            console.error('Error fetching memes:', error);
        } finally {
            isLoading = false;
            loader.style.display = 'none';
        }
    };

    const toggleSaveMeme = async (meme, button) => {
        const isSaved = button.classList.contains('saved');
        const endpoint = isSaved ? 'unsave_meme.php' : 'save_meme.php';

        console.log(`[${isSaved ? 'Unsave' : 'Save'}] meme: ${meme.url}`);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: new URLSearchParams({ meme_url: meme.url })
            });

            const data = await res.json();
            console.log("Server response:", data);

            if (data.success) {
                if (isSaved) {
                    button.innerHTML = '<i class="fas fa-save"></i> Save';
                    button.classList.remove('saved');
                    showAlert('Meme unsaved!');
                } else {
                    button.innerHTML = '<i class="fas fa-check"></i> Saved';
                    button.classList.add('saved');
                    showAlert('Meme saved!');
                }
            } else {
                showAlert(`Error: ${data.error}`);
                console.error('Save/Unsave failed:', data.error);
            }
        } catch (err) {
            showAlert('Failed to connect to backend');
            console.error('Fetch error:', err);
        }
    };

    const showAlert = (message) => {
        let alertBox = document.createElement('div');
        alertBox.className = 'alert';
        alertBox.textContent = message;
        document.body.appendChild(alertBox);
        setTimeout(() => alertBox.classList.add('show'), 10);
        setTimeout(() => {
            alertBox.classList.remove('show');
            setTimeout(() => alertBox.remove(), 300);
        }, 3000);
    };

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadMemes();
        }
    });

    (async () => {
        await fetchSavedMemes();
        loadMemes();
    })();
});
