import dotenv from 'dotenv'; // For ES Modules (if using "type": "module" in package.json)
// OR
require('dotenv').config();  // For CommonJS

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;



window.onload = async function () {
    const GIST_API_URL = "https://api.github.com/gists/c1f9dbc8ddd2f59f5baa096aeb85b9f4";
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
    }, 2000);

    video.addEventListener('play', () => video.removeAttribute('controls'));
    video.addEventListener('pause', () => video.setAttribute('controls', true));
    video.addEventListener('ended', () => video.setAttribute('controls', true));

    let heartClicks = 0;
    try {
        const response = await fetch(GIST_API_URL);
        const data = await response.json();
        const content = JSON.parse(data.files[GIST_FILE_NAME].content);

        heartClicks = content.likes || 0;
        heartCount.textContent = heartClicks;

        const today = new Date().toISOString().split('T')[0];
        if (content.date !== today) {
            await updateGist({ likes: content.likes || 0, comments: [], date: today });
        } else {
            (content.comments || []).forEach(comment => {
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
        await updateGist({ likes: heartClicks });
    });

    submitCommentBtn.addEventListener('click', async () => {
        const commentText = commentInput.value.trim();
        const username = usernameInput.value.trim() || 'Anonymous';

        if (commentText) {
            const commentDiv = document.createElement('div');
            commentDiv.innerHTML = `<strong>${username}:</strong> ${commentText}`;
            commentsList.appendChild(commentDiv);

            try {
                const response = await fetch(GIST_API_URL);
                const data = await response.json();
                const content = JSON.parse(data.files[GIST_FILE_NAME].content);

                const comments = content.comments || [];
                comments.push({ username, text: commentText });

                await updateGist({ likes: content.likes || 0, comments, date: content.date });
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
