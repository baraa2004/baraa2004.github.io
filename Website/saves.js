document.addEventListener('DOMContentLoaded', () => {
    const savedMemesContainer = document.getElementById('savedMemesContainer');
    const savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];

    if (savedMemes.length === 0) {
        savedMemesContainer.innerHTML = '<p>No saved memes found.</p>';
        return;
    }

    savedMemes.forEach((meme, index) => {
        const memeElement = document.createElement('div');
        memeElement.classList.add('meme');
        memeElement.innerHTML = `
            <img src="${meme.url}" alt="Saved Meme">
            <button class="unsave-button" data-index="${index}">Unsave</button>
        `;
        savedMemesContainer.appendChild(memeElement);
    });

    savedMemesContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('unsave-button')) {
            const memeIndex = event.target.getAttribute('data-index');
            savedMemes.splice(memeIndex, 1);
            localStorage.setItem('savedMemes', JSON.stringify(savedMemes));
            location.reload(); // Reload the page to reflect changes
        }
    });
});