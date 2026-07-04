import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import io

app = Flask(__name__)
CORS(app)

# Load model CLIP local
print("Starting CLIP model (openai/clip-vit-base-patch32)...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print(f"CLIP model loaded on {device}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "device": device})

@app.route('/embed', methods=['POST'])
def embed():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        file = request.files['image']
        image = Image.open(file.stream).convert("RGB")
        
        # Preprocess and generate image features
        inputs = processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model.get_image_features(**inputs)
            
            # Robust extraction of the tensor
            if isinstance(outputs, torch.Tensor):
                image_features = outputs
            elif hasattr(outputs, 'image_embeds'):
                image_features = outputs.image_embeds
            elif hasattr(outputs, 'pooler_output'):
                image_features = outputs.pooler_output
            elif isinstance(outputs, (list, tuple)):
                image_features = outputs[0]
            else:
                image_features = outputs
        
        # Normalize and convert to list
        if hasattr(image_features, 'norm'):
            image_features /= image_features.norm(dim=-1, keepdim=True)
        
        embedding = image_features.cpu().numpy().tolist()[0]
        
        return jsonify({"embedding": embedding})
    
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('CLIP_PORT', 5005))
    app.run(host='0.0.0.0', port=port)
