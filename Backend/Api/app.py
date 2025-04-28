from flask import Flask, request, jsonify
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
import torch
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load BERT model and tokenizer
MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models/bert_fakenews_model')
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

# Create pipeline
bert_classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)

@app.route('/api/bert_predict', methods=['POST'])
def bert_predict():
    data = request.get_json()
    news_text = data.get('text', '')
    
    if not news_text:
        return jsonify({'error': 'No text provided'}), 400

    prediction = bert_classifier(news_text)[0]  # BERT gives LABEL_0 or LABEL_1

    #  Add this label map
    label_map = {
        "LABEL_0": "Real",
        "LABEL_1": "Fake"
    }
    
    # Map BERT output label to human-readable
    mapped_prediction = label_map.get(prediction['label'], prediction['label'])

    # Prepare final result
    result = {
        'prediction': mapped_prediction,  # MAPPED to "Real" or "Fake"
        'confidence': round(prediction['score'], 4)  # Round confidence score
    }
    
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
