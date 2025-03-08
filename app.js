
window.onload = async function () {
    const GIST_API_URL = "/getGistData"; // Backend URL
    const GIST_FILE_NAME = "data.json";

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
    }, 1000);

    video.addEventListener('play', () => video.removeAttribute('controls'));
    video.addEventListener('pause', () => video.setAttribute('controls', true));
    video.addEventListener('ended', () => video.setAttribute('controls', true));

    database.ref('likes').on('value', (snapshot) => {
        heartClicks = snapshot.val() || 0;
        heartCount.textContent = heartClicks;
    });
    
    document.querySelector('.reactions').addEventListener('click', async () => {
        database.ref('likes').transaction((currentLikes) => {
            return (currentLikes || 0) + 1;
        });
    });
    

    document.querySelector('.reactions').addEventListener('click', async () => {
        heartClicks++;
        heartCount.textContent = heartClicks;
        await updateGist({ likes: heartClicks });
    });

    submitCommentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        const username = usernameInput.value.trim() || 'Anonymous';
    
        if (commentText) {
            const newCommentRef = database.ref('comments').push();
            newCommentRef.set({
                username: username,
                text: commentText
            });
    
            commentInput.value = '';
        }
    });
    
    // Display comments in real-time
    database.ref('comments').on('child_added', (snapshot) => {
        const commentData = snapshot.val();
        const commentDiv = document.createElement('div');
        commentDiv.innerHTML = `<strong>${commentData.username}:</strong> ${commentData.text}`;
        commentsList.appendChild(commentDiv);
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

    async function updateGist(updatedData) {
        await fetch(GIST_API_URL, {
            method: 'PATCH',
            headers: {
                'Authorization': 'token ' + GITHUB_ACCESS_TOKEN,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_FILE_NAME]: {
                        content: JSON.stringify(updatedData, null, 2)
                    }
                }
            })
        });
    }
};

