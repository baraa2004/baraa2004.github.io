document.addEventListener('DOMContentLoaded', async () => {
    const savedMemesContainer = document.getElementById('savedMemesContainer');
    const res = await fetch('get_saved_memes.php');
    const savedMemes = await res.json();

    if (!Array.isArray(savedMemes) || savedMemes.length === 0) {
        savedMemesContainer.innerHTML = '<p>No saved memes found.</p>';
        return;
    }

    savedMemes.forEach(url => {
        const memeElement = document.createElement('div');
        memeElement.classList.add('meme');
        memeElement.innerHTML = `
            <img src="${url}" alt="Saved Meme">
            <button class="unsave-button" data-url="${url}">Unsave</button>
        `;
        savedMemesContainer.appendChild(memeElement);
    });

    savedMemesContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('unsave-button')) {
            const meme_url = event.target.getAttribute('data-url');
            await fetch('unsave_meme.php', {
                method: 'POST',
                body: new URLSearchParams({ meme_url })
            });
            location.reload();
        }
    });
});
