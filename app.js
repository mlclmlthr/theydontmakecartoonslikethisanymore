window.onload = async function () {
    const JSONBIN_API_URL = "https://api.jsonbin.io/v3/b/67cc3cfbacd3cb34a8f71b78"; 
    const JSONBIN_SECRET_KEY = "$2a$10$Tksj0KA1EzgFADA66tfUYeDVqIetaiQyb1o7XdtWMlsjpv6hDNET6";

    const title = document.getElementById('title');
    const videoSection = document.getElementById('video-section');
    const video = document.querySelector('video');
    const heartCount = document.getElementById('heart-count');
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment');
    const usernameInput = document.getElementById('username-input');

    setTimeout(() => {
        title.style.display = 'none';
        videoSection.style.display = 'block';
        video.play();
    }, 2000);

    video.addEventListener('play', () => video.removeAttribute('controls'));
    video.addEventListener('pause', () => video.setAttribute('controls', true));
    video.addEventListener('ended', () => video.setAttribute('controls', true));

    let heartClicks = 0;
    try {
        const response = await fetch(`${JSONBIN_API_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_SECRET_KEY }
        });
        const data = await response.json();

        heartClicks = data.record.likes || 0;
        heartCount.textContent = heartClicks;

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
        heartClicks++;
        heartCount.textContent = heartClicks;

        try {
            await fetch(JSONBIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_SECRET_KEY
                },
                body: JSON.stringify({ likes: heartClicks })
            });
        } catch (error) {
            console.error('Error updating likes:', error);
        }
    });

    submitCommentBtn.addEventListener('click', async () => {
        const commentText = commentInput.value.trim();
        const username = usernameInput.value.trim() || 'Anonymous';

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
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    });
};