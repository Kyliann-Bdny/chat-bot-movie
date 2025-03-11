let previousMovies = [];

document.getElementById('chatbot-circle').addEventListener('click', async function() {
    document.getElementById('chatbot-container').style.display = 'flex';
    document.getElementById('chatbot-circle').style.display = 'none';

    const messageHistoryDiv = document.getElementById('message-history');

    // Display initial bot message
    const loadingDots = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start' id='loading-dots'>🤖 ChatBot : <span class='dots'>...</span></div>`;
    messageHistoryDiv.innerHTML += loadingDots;
    messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;

    const initialResponse = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: 'Bonjour' })
    });

    const initialData = await initialResponse.json();
    document.getElementById('loading-dots').remove();

    if (!initialData.error) {
        const botMessage = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start'>🤖 ChatBot : ${initialData.response || 'Aucune réponse trouvée.'}</div>`;
        messageHistoryDiv.innerHTML += botMessage;
        messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;
    }

    // Re-display previous movies if any
    if (previousMovies.length > 0) {
        const movieInfoDiv = document.getElementById('movie-info');
        movieInfoDiv.innerHTML = '';
        previousMovies.forEach(movie => {
            movieInfoDiv.innerHTML += `
                <div class="mt-4 p-4 border border-cyan-400 rounded-lg bg-white shadow-md">
                    <h3 class="text-xl font-semibold text-gray-900">${movie.title}</h3>
                    ${movie.image_url ? `<img src="${movie.image_url}" alt="${movie.title}" class="mt-4 w-full object-cover rounded-md shadow-lg">` : ''}
                    <p class="mt-4 text-gray-700">${movie.overview}</p>
                </div>
            `;
        });
        document.getElementById('movie-popup').style.display = 'flex';
    }
});

document.getElementById('chat-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const userInput = document.getElementById('user_input').value;
    const messageHistoryDiv = document.getElementById('message-history');
    const movieInfoDiv = document.getElementById('movie-info');

    const userMessage = `<div class='bg-blue-500 text-white p-3 rounded-lg w-fit max-w-xs self-end'>👤 Vous : ${userInput}</div>`;
    messageHistoryDiv.innerHTML += `<div class='flex flex-col space-y-2'>${userMessage}</div>`;
    messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;
    
    const loadingDots = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start' id='loading-dots'>🤖 ChatBot : <span class='dots'>...</span></div>`;
    messageHistoryDiv.innerHTML += loadingDots;
    messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;
    
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    });

    const data = await response.json();
    document.getElementById('loading-dots').remove();
    
    if (!data.error) {
        const botMessage = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start'>🤖 ChatBot : ${data.response || 'Aucune réponse trouvée.'}</div>`;
        messageHistoryDiv.innerHTML += botMessage;
        messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;

        if (data.movie_info && data.movie_info.length > 0) {
            movieInfoDiv.innerHTML = '';
            previousMovies = data.movie_info; // Store the movies in the global variable
            data.movie_info.forEach(movie => {
                movieInfoDiv.innerHTML += `
                    <div class="mt-4 p-4 border border-cyan-400 rounded-lg bg-white shadow-md">
                        <h3 class="text-xl font-semibold text-gray-900">${movie.title}</h3>
                        ${movie.image_url ? `<img src="${movie.image_url}" alt="${movie.title}" class="mt-4 w-full object-cover rounded-md shadow-lg">` : ''}
                        <p class="mt-4 text-gray-700">${movie.overview}</p>
                    </div>
                `;
            });
            document.getElementById('movie-popup').style.display = 'flex';
        }
    }
    document.getElementById('user_input').value = '';
});

document.getElementById('close-chatbot').addEventListener('click', function() {
    document.getElementById('chatbot-container').style.display = 'none';
    document.getElementById('chatbot-circle').style.display = 'flex';
    document.getElementById('movie-popup').style.display = 'none';
});