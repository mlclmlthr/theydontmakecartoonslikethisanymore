// server.js
const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const app = express();
const port = 3000; // Choose a port for your server

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const GIST_API_URL = "https://api.github.com/gists/c1f9dbc8ddd2f59f5baa096aeb85b9f4";
const GIST_FILE_NAME = "data.json";

app.use(express.static('public')); // Serve your frontend files

// API to get Gist data
app.get('/getGistData', async (req, res) => {
  try {
    const response = await fetch(GIST_API_URL, {
      headers: {
        'Authorization': `token ${GITHUB_ACCESS_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Gist data:', error);
    res.status(500).json({ error: 'Failed to fetch Gist data' });
  }
});

// API to update Gist data
app.post('/updateGist', express.json(), async (req, res) => {
  const updatedData = req.body; // Expect the request body to contain the updated data

  try {
    const response = await fetch(GIST_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_ACCESS_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILE_NAME]: {
            content: JSON.stringify(updatedData, null, 2)
          }
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error updating Gist data:', error);
    res.status(500).json({ error: 'Failed to update Gist data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
