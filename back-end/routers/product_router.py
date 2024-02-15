from fastapi import APIRouter, status, Response, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


class PostProduct(BaseModel):
    name: str
    category: str
    quantity: int
    price: float


supabaseUrl = "https://cvuiuqgykwoicwpavhrs.supabase.co"
supabaseKey = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url=supabaseUrl, supabase_key=supabaseKey)


@router.post("/create")
def create_product(post: PostProduct, response: Response):
    if post:
        data, count = supabase.table('products').insert(post.dict()).execute()
        return data
    else:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return


@router.get("/all")
def all_products(response: Response):
    try:
        data = supabase.table('products').select('*').execute()
        if data.error:
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return {"detail": str(data.error)}
        return data.data
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.put("/update/{product_id}")
def update_product(product_id: int, post: PostProduct, response: Response):
    try:
        exists = supabase.table('products').select('*').eq('id', product_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {product_id} not found")

        updated = supabase.table('products').update(post.dict()).eq('id', product_id).execute()

        if updated.error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(updated.error))

        return updated.data
    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.delete("/delete/{product_id}")
def delete_product(product_id: int, response: Response):
    try:
        exists = supabase.table('products').select('*').eq('id', product_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {product_id} not found")

        deleted = supabase.table('products').delete().eq('id', product_id).execute()

        if deleted.error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(deleted.error))

        response.status_code = status.HTTP_204_NO_CONTENT
        return {"detail": f"Product with ID {product_id} successfully deleted"}
    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}

