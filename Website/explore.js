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

            memes.forEach(meme => {
                if (!memeContainer.querySelector(`img[src="${meme.url}"]`)) {
                    const memeElement = document.createElement('div');
                    memeElement.classList.add('meme');
                    memeElement.innerHTML = `
                        <img src="${meme.url}" alt="${meme.title}">
                        <div class="buttons">
                            <button class="save-btn">Save</button>
                            <button class="hahaha-btn">Hahaha</button>
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
                    saveButton.addEventListener('click', () => {
                        saveMeme(meme);
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

const saveMeme = (meme) => {
    let savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];
    savedMemes.push(meme);
    localStorage.setItem('savedMemes', JSON.stringify(savedMemes));
    alert('Meme saved successfully!');
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