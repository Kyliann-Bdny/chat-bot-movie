from flask import Flask, render_template, request, jsonify, make_response
import openai
import os
import re
from tmdbv3api import TMDb, Movie
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
TMDB_API_KEY = os.getenv('TMDB_API_KEY')

# Utiliser les clés API des variables d'environnement
openai.api_key = OPENAI_API_KEY

tmdb = TMDb()
tmdb.api_key = TMDB_API_KEY
tmdb.language = 'fr'  # Résultats en français

movie = Movie()

# Contexte de la conversation
context = [
    {"role": "system", "content": (
        "Tu es un assistant intelligent et amical qui aide les utilisateurs à choisir un film ou une série sur Netflix. "
        "Ton objectif est de leur proposer des recommandations basées sur leurs préférences. "
        "Tu dois adopter un ton convivial, comme un ami passionné de cinéma qui donne des conseils.\n\n"
        "**🎬 Déroulement de la conversation :**\n"
        "1️⃣ Demande d'abord à l'utilisateur s'il préfère regarder un **film** ou une **série**.\n"
        "2️⃣ Demande ensuite son **genre préféré** (ex: action, comédie, horreur, drame, science-fiction, etc.).\n"
        "3️⃣ Pose des questions pour affiner la recherche :\n"
        "   - **Durée** : 'Préférez-vous un format court (-1h30), moyen (1h30-2h) ou long (+2h) ?'\n"
        "   - **Année de sortie** : 'Vous cherchez quelque chose de récent ou un classique ?'\n"
        "   - **Langue** : 'Vous voulez un film en français, en anglais ou peu importe ?'\n"
        "   - **Acteur ou réalisateur préféré** : 'Un acteur ou un réalisateur en particulier que vous aimez ?'\n\n"
        "4️⃣ Une fois toutes les informations collectées, résume les préférences de l'utilisateur et demande une **confirmation**.\n"
        "5️⃣ Propose ensuite **5 films ou séries** qui correspondent aux critères choisis. Si l'utilisateur n'est pas satisfait, ajuste les suggestions.\n\n"
        "**🧠 Mémoire des recommandations précédentes :**\n"
        "- Souviens-toi des films et séries déjà recommandés précédemment pour éviter les répétitions.\n"
        "- Garde aussi en mémoire les films ou séries que l'utilisateur indique avoir déjà vus, afin de ne pas les proposer à nouveau.\n"
        "- Tu peux rappeler à l'utilisateur ses précédentes préférences pour faciliter de nouvelles recommandations.\n\n"
        "**🎭 Ton et style :**\n"
        "- Sois dynamique et enthousiaste, engage l'utilisateur avec des phrases comme : 'Top choix !' ou 'Super, je vais te trouver quelque chose d'incroyable !'.\n"
        "- Ajoute une touche de personnalité, comme un vrai passionné de cinéma.\n"
        "- Demande toujours confirmation avant de donner les suggestions.\n\n"
        "**🎬 Exemples d'interaction :**\n"
        "Utilisateur : 'Je veux regarder un film.'\n"
        "Chatbot : 'Super ! Quel genre te tente le plus ? Action, comédie, science-fiction… ?'\n"
        "Utilisateur : 'Science-fiction.'\n"
        "Chatbot : 'Top choix ! Tu veux un film plutôt court (-1h30), moyen (1h30-2h) ou long (+2h) ?'\n"
        "Utilisateur : 'Moyen.'\n"
        "Chatbot : 'D'accord ! Tu veux quelque chose de récent ou un classique ?'\n"
        "Utilisateur : 'Plutôt récent.'\n"
        "Chatbot : 'Parfait ! Je résume : **film de science-fiction, durée moyenne, récent**. C’est bien ça ?'\n"
        "Utilisateur : 'Oui !'\n"
        "Chatbot : 'Super ! Voici 5 films qui correspondent à tes critères...' (puis liste 5 films).\n\n"
        "📌 À chaque nouvelle demande, vérifie toujours ta mémoire pour éviter de recommander des contenus déjà vus ou déjà proposés auparavant."
    )}
]

profiles = {}

# Routes de l'application Flask
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.cookies.get('userId')
    if not user_id:
        user_id = 'user-' + os.urandom(16).hex()
        profiles[user_id] = {"messages": [], "movieHistory": []}
        response = make_response(jsonify({"userId": user_id, "userProfile": profiles[user_id]}))
        response.set_cookie('userId', user_id, max_age=365*24*60*60)
        return response
    user_profile = profiles.get(user_id, {"messages": [], "movieHistory": []})
    return jsonify({"userId": user_id, "userProfile": user_profile})

@app.route('/profile', methods=['POST'])
def save_profile():
    data = request.get_json()
    user_id = data.get('userId')
    user_profile = data.get('userProfile')
    profiles[user_id] = user_profile
    return jsonify({"status": "success"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('user_input')
    context.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=context,
            max_tokens=200,
            temperature=0.8
        )

        response_text = response['choices'][0]['message']['content'].strip()
        context.append({"role": "assistant", "content": response_text})

        titres = re.findall(r'\d+\.\s?"?(.+?)"?\s?\(\d{4}\)', response_text)
        movie_info = []

        if titres:
            for titre in titres:
                search_result = movie.search(titre)
                if search_result:
                    film = search_result[0]
                    poster_path = film.poster_path
                    if (poster_path):
                        image_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                        movie_info.append({
                            'title': film.title,
                            'image_url': image_url,
                            'overview': film.overview
                        })
                else:
                    movie_info.append({'title': titre, 'image_url': None, 'overview': 'Aucune info trouvée.'})

        return jsonify({'response': response_text, 'movie_info': movie_info})

    except Exception as e:
        return jsonify({'error': str(e)})

# Lancer l'application Flask
if __name__ == '__main__':
    app.run(debug=True)