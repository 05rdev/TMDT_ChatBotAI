import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import requests
from io import BytesIO

def test_clip():
    try:
        print("Loading CLIP model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print(f"Model loaded on {device}")

        # Test URL (from the user's logs)
        url = "https://res.cloudinary.com/do8svjo8h/image/upload/v1776794101/products/169271d6-6fde-4465-8fe2-5d97c031cbc3/lwmy3fzudy8hrqhlak4x.jpg"
        print(f"Downloading image from: {url}")
        
        response = requests.get(url, timeout=10)
        image = Image.open(BytesIO(response.content)).convert("RGB")
        print("Image opened successfully")

        inputs = processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model.get_image_features(**inputs)
            print(f"Output type: {type(outputs)}")
            
            # Robust extraction
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
        
        print(f"Extracted features type: {type(image_features)}")
        if hasattr(image_features, 'norm'):
            image_features /= image_features.norm(dim=-1, keepdim=True)
            
        embedding = image_features.cpu().numpy().tolist()[0]
        
        print(f"Embedding generated! Size: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_clip()
