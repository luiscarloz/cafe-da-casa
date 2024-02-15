from fastapi import FastAPI, status, Response
from models.models import PostProduct
from config.database import supabase

app = FastAPI()


@app.post("/create_product")
def create_product(post: PostProduct, response: Response):
    if post:
        data, count = supabase.table('products').insert(post.dict()).execute()
        return data
    else:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return

