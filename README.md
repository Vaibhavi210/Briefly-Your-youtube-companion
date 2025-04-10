# 🎥 YouTube Video Summarizer with AI

A full-stack AI-powered web application that summarizes YouTube videos using Google Gemini, built with:
- 🧠 AI (Google Generative AI)
- 🐍 Python (Flask + Django REST)
- ⚛️ React (Frontend)
- 🐘 PostgreSQL (Database for history)
- 🐳 Docker (Fully containerized)

---

## 🚀 Features

- 🔍 Paste a YouTube link and get an instant summary
- 📝 MCQs, short Q&A, bullet points
- 🎧 Podcast mode (Audio summary)
- 🌍 Multilingual summary generation
- 📥 Download content as PDF
- 🔎 Search inside transcript
- 📊 AI-Powered insights (sentiment, keywords)
- 📚 Save summary history via Django + PostgreSQL

---

## 🧱 Tech Stack

| Layer       | Technology         |
|------------|--------------------|
| Frontend   | React, JavaScript  |
| Backend    | Flask (Summary API), Django (Auth + History API) |
| Database   | PostgreSQL         |
| AI         | Google Gemini (via Generative AI SDK) |
| Container  | Docker + Docker Compose |

---



## Getting Started

To set up and run Briefly on your local machine, follow these steps:

### Prerequisites

Ensure you have the following installed:

- [Python 3.x](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Vaibhavi210/Briefly-Your-youtube-companion.git
2. **Navigate to the Project Directory**:

   ```bash
   cd Briefly-Your-youtube-companion
3. **(Optional) Create a Virtual Environment**:
    python -m venv venv
    source venv/bin/activate       # On Windows: venv\Scripts\activate
4. **Install the Dependencies**:
    pip install -r requirements.txt
5. **Set Up Environment Variables**:
    Create a .env file in the root directory and add your Google Gemini API key and sensitive data:
    For eg:GEMINI_API_KEY=your_gemini_api_key
6. **Run the App Flask app**:
    python app.py
7. **Run Django app for authentication**:
    python manage.py runserver
8. **Run React app**:
    npm start


## FOR  RUNNING IN DOCKER:
1. 1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Vaibhavi210/Briefly-Your-youtube-companion.git
2. **Navigate to the Project Directory**:

   ```bash
   cd Briefly-Your-youtube-companion
3. **Set Up Environment Variables**:
    Create a .env file in the root directory and in subfolders whereever necessary and add your Google Gemini API key and sensitive data :
    For eg:GEMINI_API_KEY=your_gemini_api_key
4. **Run the app**:
    docker-compose up --build



