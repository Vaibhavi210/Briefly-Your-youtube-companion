from flask_cors import CORS
from flask import Flask,request,jsonify,send_file
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from dotenv import load_dotenv
import os
from gtts import gTTS
from deep_translator import GoogleTranslator
from flask_limiter import Limiter

from flask_limiter.util import get_remote_address
# Load API key from .env file
load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)  # Allows React frontend to call Flask API

# Configure rate limiter
limiter = Limiter(
    get_remote_address,  # Use IP address for rate limiting if no user authentication
    app=app,
    default_limits=["5 per minute"]  # Default limit for all routes
)

@app.errorhandler(429)
def too_many_requests(e):
    return jsonify(error="Too many requests. Please try again later."), 429


@app.route("/text-to-speech",methods=['POST'])
@limiter.limit("5 per minute")
def textToSpeech():
    data = request.get_json()
    text=data.get('text','')
    if not text:
        return jsonify({'error':'No text provided'}), 400
    
    try:
        tts=gTTS(text=text,lang="en")
        audio_path="output.mp3"
        tts.save(audio_path)
        return send_file(audio_path,as_attachment=True)
    except Exception as e:
        return jsonify({'error':str(e)}),500

def get_transcript(video_id,language="en"):
    try:
        # transcript=YouTubeTranscriptApi.get_transcript(video_id)
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try fetching transcript in the selected language
        transcript = None
        for transcript_obj in transcript_list:
            if transcript_obj.language_code == language or language in transcript_obj.language:
                transcript = transcript_obj.fetch()
                break
        if transcript is None:
            return "No transcript available in the requested language."
        text=" ".join([entry["text"] for entry in transcript])
        return text
    except Exception as e:
        return str(e)
    


def summarize_text(text):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        # response= model.generate_content(f"Summarize this: {text}")
        # return response.text.strip()   # Extract summarized text
        prompt = f"""
        Summarize the following text in plain text format without any styling or formatting:
        
        {text}
        """
        
        response = model.generate_content(prompt)
        
        # Extract and clean the text
        summary = response.text.strip()
        return summary
    except Exception as e:
        return str(e)
    
def get_transcript(video_id, language="en"):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Try to get transcript directly in the requested language
        try:
            transcript = transcript_list.find_transcript([language]).fetch()
        except:
            transcript = None

        # If not available, try manually checking alternative translations
        if not transcript:
            for transcript_obj in transcript_list:
                if transcript_obj.language_code.startswith(language) or language in transcript_obj.language:
                    transcript = transcript_obj.fetch()
                    break

        if not transcript:
            return "No transcript available in the requested language."

        text = " ".join([entry["text"] for entry in transcript])
        return text

    except Exception as e:
        return str(e)
import re




    
@app.route('/generate-content', methods=['POST'])
@limiter.limit("2 per minute") 
def generate_content():
   
    data = request.json
    summary = data.get("summary")
    target_language = data.get("language", "en")  # Get requested language with English as default
    
    # Validate and clamp values between 1-10
    num_questions = min(max(data.get("num_questions", 3), 1), 10)
    num_mcqs = min(max(data.get("num_mcqs", 3), 1), 10)
    num_bullets = min(max(data.get("num_bullets", 5), 1), 10)

    if not summary:
        return jsonify({"error": "Summary is required"}), 400

    # Improved prompt with explicit structure
    prompt = f"""Generate the following based on this content: {summary}

Format your response EXACTLY as follows:

# SHORT ANSWER ({num_questions} questions)
1. [Question 1]
Answer: [Answer 1]
2. [Question 2]
Answer: [Answer 2]
...
{num_questions}. [Question N]
Answer: [Answer N]

# MCQS ({num_mcqs} questions)
1. Question: [Question 1]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [Correct Letter]
...
{num_mcqs}. Question: [Question N]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [Correct Letter]

# KEY POINTS ({num_bullets} points)
- [Point 1]
- [Point 2]
...
- [Point N]"""

    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(prompt)
        
        if not response or not response.candidates:
            return jsonify({"error": "Failed to generate content"}), 500

        generated_text = response.candidates[0].content.parts[0].text

        # Improved parsing with fallbacks
        def parse_section(content, start_tag, end_tag=None):
            sections = content.split(start_tag)
            if len(sections) < 2:
                return ""
            section = sections[1]
            if end_tag:
                section = section.split(end_tag)[0]
            return section.strip()

        # Parse short answers
        short_questions = []
        saq_section = parse_section(generated_text, "# SHORT ANSWER (", "# MCQS")
        if saq_section:
            qa_pairs = re.findall(r"\d+\.\s*(.*?)\s*Answer:\s*(.*?)(?=\n\d+\.|\n#|$)", saq_section, re.DOTALL)
            short_questions = [{"question": q.strip(), "answer": a.strip()} for q, a in qa_pairs]

        # Parse MCQs
        mcqs = []
        mcq_section = parse_section(generated_text, "# MCQS (", "# KEY POINTS")
        if mcq_section:
            mcq_blocks = re.split(r"\n\d+\.", mcq_section)
            for block in mcq_blocks:
                question_match = re.search(r"Question:\s*(.+?)\n", block)
                options = dict(re.findall(r"([A-D])\.\s*(.+?)(?=\n[A-D]\.|\nAnswer:|$)", block))
                answer_match = re.search(r"Answer:\s*([A-D])", block)
                if question_match and options and answer_match:
                    mcqs.append({
                        "question": question_match.group(1).strip(),
                        "options": options,
                        "answer": answer_match.group(1).strip()
                    })

        # Parse bullet points
        bullet_points = []
        bp_section = parse_section(generated_text, "# KEY POINTS (")
        if bp_section:
            bullet_points = re.findall(r"-\s*(.*?)(?=\n-|$)", bp_section)
            bullet_points = [bp.strip() for bp in bullet_points if bp.strip()]

        # Prepare response data
        response_data = {
            "short_questions": short_questions[:num_questions],
            "mcqs": mcqs[:num_mcqs],
            "bullet_points": bullet_points[:num_bullets],
            "language": target_language  # Include language in response
        }

    
        if target_language.lower() != "en":
            try:
                print(f"Starting translation to {target_language}")
            
                # Translate short questions one by one with error handling
                for question in response_data["short_questions"]:
                    try:
                        question["question"] = translate_text(question["question"], target_language)
                        question["answer"] = translate_text(question["answer"], target_language)
                        print(f"Successfully translated question: {question['question'][:20]}...")
                    except Exception as e:
                        print(f"Failed to translate question: {str(e)}")
            
            # Translate MCQs
                for mcq in response_data["mcqs"]:
                    try:
                        mcq["question"] = translate_text(mcq["question"], target_language)
                        for key in list(mcq["options"].keys()):  # Use list() to avoid dictionary size change during iteration
                            mcq["options"][key] = translate_text(mcq["options"][key], target_language)
                        print(f"Successfully translated MCQ: {mcq['question'][:20]}...")
                    except Exception as e:
                        print(f"Failed to translate MCQ: {str(e)}")
            
                # Translate bullet points
                new_bullet_points = []
                for point in response_data["bullet_points"]:
                    try:
                        translated_point = translate_text(point, target_language)
                        new_bullet_points.append(translated_point)
                        print(f"Successfully translated bullet point: {translated_point[:20]}...")
                    except Exception as e:
                        new_bullet_points.append(point)  # Keep original if translation fails
                        print(f"Failed to translate bullet point: {str(e)}")
            
                response_data["bullet_points"] = new_bullet_points
                print("All translations completed")
                
            except Exception as e:
                print(f"Translation process failed: {str(e)}")
                # Return the original content with a warning
                response_data["translation_warning"] = f"Some content could not be translated: {str(e)}"
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
    return jsonify(response_data)
def translate_text(text, target_language):
    """Translate text to the desired language."""
    try:
        if target_language and target_language.lower() != "en":  # Only translate if not English
            translated_text = GoogleTranslator(source="auto", target=target_language).translate(text)
            if not translated_text or translated_text.strip() == "":
                raise ValueError("Translation failed, empty response")
            return translated_text
        return text  # Return original if English
    except Exception as e:
        return f"Translation error: {str(e)}"


@app.route("/summarize",methods=["POST"])
@limiter.limit("2 per minute")
def summarize():
    data=request.json
    video_url=data.get("url")
    target_language = data.get("language", "en")  # Default to English

    if not video_url:
        return jsonify({"error":"URL is required"}), 400
    
    #exctract video ID from URL
    video_id=video_url.split("v=")[-1].split("&")[0]

    
    transcript = get_transcript(video_id, target_language)
    if "No transcript available" in transcript:
        return jsonify({"error": "Transcript not found in your desired language"}), 404

    
    summary=summarize_text(transcript)

    translated_summary = translate_text(summary, target_language)
   

    return jsonify({
        "summary": translated_summary,
        "original_summary": summary,
        "language": target_language
    })

# if __name__=="__main__":
#     app.run(debug=True)
# At the end of your app.py file, change:
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
    
    


