"""
OpenAI GPT-4 Vision Service for Product Analysis
Provides real AI-powered product categorization and analysis
"""
import os
import base64
import asyncio
from typing import Dict, List, Optional, Any
from openai import AsyncOpenAI
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

class OpenAIVisionService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = "gpt-4-vision-preview"
        
    def _encode_image(self, image_path: str) -> str:
        """Encode image to base64 for OpenAI API"""
        try:
            # Optimize image size to reduce token costs
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large (max 2048px on longest side for cost efficiency)
                max_size = 1024
                if max(img.size) > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save optimized image to bytes
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
                img_byte_arr = img_byte_arr.getvalue()
                
                return base64.b64encode(img_byte_arr).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            raise

    async def analyze_product(self, image_path: str, filename: str = "") -> Dict[str, Any]:
        """
        Analyze product image using GPT-4 Vision
        Returns structured product analysis
        """
        try:
            # Encode image
            base64_image = self._encode_image(image_path)
            
            # Craft detailed prompt for product analysis
            prompt = """
            Analyze this product image and provide detailed information in the following JSON format:
            
            {
                "product_type": "specific product category (e.g., 'Backpack', 'Sneakers', 'Smartphone')",
                "category": "broad category (e.g., 'Fashion', 'Electronics', 'Home & Garden')",
                "style": "aesthetic style (e.g., 'Modern Minimalist', 'Vintage', 'Sporty', 'Luxury')",
                "colors": ["primary color", "secondary color", "accent color"],
                "key_features": ["feature1", "feature2", "feature3", "feature4"],
                "target_audience": "demographic description",
                "brand_detected": "brand name if visible, otherwise 'Unknown'",
                "price_range": "estimated price range (e.g., 'Budget', 'Mid-range', 'Premium', 'Luxury')",
                "material": "primary material if identifiable",
                "use_case": "primary use case or occasion",
                "marketing_angle": "best marketing approach for this product",
                "confidence_score": 0.95
            }
            
            Be specific and accurate. Focus on visual elements you can clearly see.
            For colors, use common color names (e.g., 'Navy Blue', 'Forest Green', 'Rose Gold').
            For features, focus on visible characteristics that would appeal to customers.
            """
            
            # Make API call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=800,
                temperature=0.1  # Lower temperature for more consistent results
            )
            
            # Extract and parse response
            content = response.choices[0].message.content
            
            # Try to parse JSON from response
            import json
            try:
                # Find JSON in response (GPT sometimes adds extra text)
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    analysis = json.loads(json_str)
                else:
                    raise ValueError("No JSON found in response")
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to parse JSON response: {e}")
                # Fallback to parsed response
                analysis = self._parse_fallback_response(content)
            
            # Add metadata
            analysis['tokens_used'] = response.usage.total_tokens
            analysis['cost_estimate'] = (
                response.usage.prompt_tokens * 0.01 / 1000 + 
                response.usage.completion_tokens * 0.03 / 1000
            )
            analysis['filename'] = filename
            
            logger.info(f"Product analysis completed. Tokens used: {response.usage.total_tokens}")
            return {
                "success": True,
                "analysis": analysis,
                "raw_response": content
            }
            
        except Exception as e:
            logger.error(f"Error analyzing product: {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis": self._get_fallback_analysis()
            }
    
    def _parse_fallback_response(self, content: str) -> Dict[str, Any]:
        """Parse response when JSON parsing fails"""
        return {
            "product_type": "Unknown Product",
            "category": "General",
            "style": "Modern",
            "colors": ["Unknown"],
            "key_features": ["Quality Product"],
            "target_audience": "General Audience",
            "brand_detected": "Unknown",
            "price_range": "Mid-range",
            "material": "Unknown",
            "use_case": "Daily Use",
            "marketing_angle": "Quality and Style",
            "confidence_score": 0.3,
            "note": "Analysis parsing failed, using fallback"
        }
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Fallback analysis when API fails"""
        return {
            "product_type": "Product",
            "category": "General",
            "style": "Modern",
            "colors": ["Blue", "White"],
            "key_features": ["Quality", "Durable"],
            "target_audience": "General Audience",
            "brand_detected": "Unknown",
            "price_range": "Mid-range",
            "material": "Unknown",
            "use_case": "Daily Use",
            "marketing_angle": "Quality and Value",
            "confidence_score": 0.1,
            "note": "API analysis failed, using fallback"
        }

    async def analyze_multiple_products(self, image_paths: List[str]) -> List[Dict[str, Any]]:
        """Analyze multiple products efficiently"""
        results = []
        
        # Process in batches to avoid rate limits
        batch_size = 3
        for i in range(0, len(image_paths), batch_size):
            batch = image_paths[i:i + batch_size]
            
            # Analyze batch concurrently
            tasks = [
                self.analyze_product(path, os.path.basename(path)) 
                for path in batch
            ]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    logger.error(f"Batch analysis error: {result}")
                    results.append({
                        "success": False,
                        "error": str(result),
                        "analysis": self._get_fallback_analysis()
                    })
                else:
                    results.append(result)
            
            # Small delay between batches to respect rate limits
            if i + batch_size < len(image_paths):
                await asyncio.sleep(0.5)
        
        return results

# Global instance
openai_vision_service = OpenAIVisionService()
