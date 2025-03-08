window.onload = async function () {
    const JSONBIN_API_URL = "https://api.jsonbin.io/v3/b/67cc3cfbacd3cb34a8f71b78";  // Replace with your JSONBin ID
    const JSONBIN_SECRET_KEY = "$2a$10$Tksj0KA1EzgFADA66tfUYeDVqIetaiQyb1o7XdtWMlsjpv6hDNET6";  // Replace with your JSONBin Secret Key

    const title = document.getElementById('title');
    const videoSection = document.getElementById('video-section');
    const video = document.querySelector('video');
    const heartCount = document.getElementById('heart-count');
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment');

    setTimeout(() => {
        title.style.display = 'none';
        videoSection.style.display = 'block';
        video.play(); // Autoplay video after 2 seconds
    }, 2000);

    video.addEventListener('play', () => {
        video.removeAttribute('controls'); // Hide controls while playing
    });

    video.addEventListener('pause', () => {
        video.setAttribute('controls', true); // Show controls when paused
    });

    video.addEventListener('ended', () => {
        video.setAttribute('controls', true); // Show controls after video ends
    });

    try {
        const response = await fetch(`${JSONBIN_API_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_SECRET_KEY }
        });
        const data = await response.json();

        let likes = data.record.likes || 0;
        heartCount.textContent = likes;

        const today = new Date().toISOString().split('T')[0];
        if (data.record.date !== today) {
            await fetch(JSONBIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_SECRET_KEY
                },
                body: JSON.stringify({ likes: data.record.likes || 0, comments: [], date: today })
            });
        } else {
            (data.record.comments || []).forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
                commentsList.appendChild(commentDiv);
            });
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }

    document.querySelector('.reactions').addEventListener('click', async () => {
        try {
            const response = await fetch(`${JSONBIN_API_URL}/latest`, {
                headers: { 'X-Master-Key': JSONBIN_SECRET_KEY }
            });
            const data = await response.json();

            let likes = data.record.likes || 0;
            likes++;

            await fetch(JSONBIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_SECRET_KEY
                },
                body: JSON.stringify({ likes, comments: data.record.comments || [], date: data.record.date })
            });

            heartCount.textContent = likes;
        } catch (error) {
            console.error('Error updating likes:', error);
        }
    });

    submitCommentBtn.addEventListener('click', async () => {
        const commentText = commentInput.value.trim();
        const username = 'Anonymous';

        if (commentText) {
            const commentDiv = document.createElement('div');
            commentDiv.innerHTML = `<strong>${username}:</strong> ${commentText}`;
            commentsList.appendChild(commentDiv);

            try {
                const response = await fetch(`${JSONBIN_API_URL}/latest`, {
                    headers: { 'X-Master-Key': JSONBIN_SECRET_KEY }
                });
                const data = await response.json();

                const comments = data.record.comments || [];
                comments.push({ username, text: commentText });

                await fetch(JSONBIN_API_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': JSONBIN_SECRET_KEY
                    },
                    body: JSON.stringify({ likes: data.record.likes || 0, comments, date: data.record.date })
                });
            } catch (error) {
                console.error('Error saving comment:', error);
            }

            commentInput.value = '';
        }
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const videoUrl = document.querySelector('video source').src;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'nostalgic_cartoon_quote.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    document.getElementById('link-btn').addEventListener('click', () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Check out this nostalgic cartoon quote!");

        const shareOptions = `
            <div class="share-ui">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank"><img src="assets/facebook.svg" alt="Facebook"></a>
                <a href="https://www.instagram.com/" target="_blank"><img src="assets/instagram.svg" alt="Insta"></a>
                <a href="https://www.youtube.com/" target="_blank"><img src="assets/youtube.svg" alt="Yt"></a>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = shareOptions;
        document.body.appendChild(tempDiv);

        setTimeout(() => {
            tempDiv.remove();
        }, 5000);
    });
};
