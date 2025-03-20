var $btn = document.querySelector('.btn');
var $form = document.getElementById('loginForm');

$btn.addEventListener('click', e => {
    e.preventDefault(); // Prevent the form from submitting immediately
    window.requestAnimationFrame(() => {
        $btn.classList.remove('is-animating');
        
        window.requestAnimationFrame(() => {
            $btn.classList.add('is-animating');
        });
    });

    // Add a delay before submitting the form
    setTimeout(() => {
        $form.submit();
    }, 1000); // 1 second delay
});
