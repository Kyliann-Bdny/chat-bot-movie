# Chat-Bot Project for Movie

## Overview
The Chat-Bot project is a web application that serves as an intelligent assistant for movie and series recommendations. It utilizes the OpenAI API for natural language processing and the TMDB API for movie information.

## Features
- Interactive chatbot interface for user input.
- Movie and series recommendations based on user preferences.
- Display of movie details including posters and summaries.

## Project Structure
```
Chat-Bot
├── templates
│   └── index.html        # Main HTML interface for the web application
├── assets
│   └── css
│       └── styles.css    # CSS styles for the web application
│   └── js
│       └── script.js     # JavaScript for the web application
├── app.py                # Main logic for the chatbot
├── requirements.txt      # List of dependencies
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Chat-Bot
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your API keys:
   - Obtain an OpenAI API key and a TMDB API key.
   - Create a `.env` file in the root directory and add your keys:
     ```
     OPENAI_API_KEY=your_openai_api_key
     TMDB_API_KEY=your_tmdb_api_key
     ```

## Usage

1. Run the application:
   ```
   python app.py
   ```

2. Open your web browser and navigate to `http://localhost:5000` to access the chatbot interface.

3. Interact with the chatbot by entering your movie or series preferences.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.