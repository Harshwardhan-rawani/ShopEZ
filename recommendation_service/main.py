from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from bson import ObjectId
import os
import os
from dotenv import load_dotenv

# Load env from the server directory
load_dotenv(dotenv_path='../server/.env')

app = FastAPI(title="ShopEZ Recommendation Service")

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017/shopez"
client = MongoClient(MONGO_URI)
# Assuming the database name is inside the URI or default to 'test'
db = client.get_database() # gets default db from URI

@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str):
    try:
        # 1. Fetch user interactions
        interactions_cursor = db.interactions.find({"user": ObjectId(user_id)})
        interactions = list(interactions_cursor)

        if not interactions:
            return {"recommendations": []}

        # Calculate score per category
        category_scores = {}
        bought_items = []
        has_category = False
        
        for interaction in interactions:
            if 'category' in interaction:
                has_category = True
                cat = interaction['category']
                weight = interaction.get('weight', 0)
                category_scores[cat] = category_scores.get(cat, 0) + weight
                
            if interaction.get('action') == 'buy' and 'product' in interaction:
                bought_items.append(str(interaction['product']))
                
        if not has_category:
            return {"recommendations": []}

        # Get top 2 categories
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        top_categories = [cat for cat, score in sorted_categories[:2]]
        
        # 3. Find products in top categories, excluding already bought items
        bought_obj_ids = [ObjectId(pid) for pid in bought_items]
        
        # Query for products in top categories that haven't been bought
        query = {
            "category": {"$in": top_categories},
            "_id": {"$nin": bought_obj_ids}
        }
        
        recommended_products_cursor = db.products.find(query).sort([("ratings", -1), ("sold", -1)]).limit(10)
        recommended_products = list(recommended_products_cursor)
        
        # Return list of product string IDs
        product_ids = [str(p['_id']) for p in recommended_products]
        
        return {"recommendations": product_ids}

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}
