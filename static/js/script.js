let previousMovies = [];
let userProfile = {
    messages: [],
    movieHistory: []
};

// Charger le profil utilisateur depuis le stockage local
function loadUserProfile() {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
    }
}

// Sauvegarder le profil utilisateur dans le stockage local
function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Envoyer un message de bienvenue
async function sendWelcomeMessage() {
    const messageHistoryDiv = document.getElementById('message-history');
    const loadingDots = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start' id='loading-dots'>🤖 ChatBot : <span class='dots'>...</span></div>`;
    messageHistoryDiv.innerHTML += loadingDots;
    messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: 'Bonjour' })
    });

    const data = await response.json();
    document.getElementById('loading-dots').remove();

    if (!data.error) {
        const botMessage = {
            role: "assistant",
            content: data.response || 'Aucune réponse trouvée.'
        };
        userProfile.messages.push(botMessage);
        saveUserProfile();

        const botMessageDiv = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start'>🤖 ChatBot : ${botMessage.content}</div>`;
        messageHistoryDiv.innerHTML += botMessageDiv;
        messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;
    }
}

document.getElementById('chatbot-circle').addEventListener('click', function() {
    document.getElementById('chatbot-container').style.display = 'flex';
    document.getElementById('chatbot-circle').style.display = 'none';
    loadUserProfile();
    sendWelcomeMessage();
});

document.getElementById('chat-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const userInput = document.getElementById('user_input').value;
    const messageHistoryDiv = document.getElementById('message-history');
    const movieInfoDiv = document.getElementById('movie-info');

    const userMessage = {
        role: "user",
        content: userInput
    };
    userProfile.messages.push(userMessage);
    saveUserProfile();

    const userMessageDiv = `<div class='bg-blue-500 text-white p-3 rounded-lg w-fit max-w-xs self-end'>👤 Vous : ${userInput}</div>`;
    messageHistoryDiv.innerHTML += `<div class='flex flex-col space-y-2'>${userMessageDiv}</div>`;
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
        const botMessage = {
            role: "assistant",
            content: data.response || 'Aucune réponse trouvée.'
        };
        userProfile.messages.push(botMessage);
        saveUserProfile();

        const botMessageDiv = `<div class='bg-gray-300 text-gray-900 p-3 rounded-lg w-fit max-w-xs self-start'>🤖 ChatBot : ${botMessage.content}</div>`;
        messageHistoryDiv.innerHTML += botMessageDiv;
        messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;

        if (data.movie_info && data.movie_info.length > 0) {
            movieInfoDiv.innerHTML = '';
            previousMovies = data.movie_info; // Store the movies in the global variable
            userProfile.movieHistory = data.movie_info;
            saveUserProfile();
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