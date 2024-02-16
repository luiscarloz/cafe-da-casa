from fastapi import status, File, UploadFile, Form, HTTPException, Depends, APIRouter, Response
from fastapi.responses import JSONResponse
import uuid
from pydantic import BaseModel
from typing import Optional
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
    description: str
    price: float


class UpdateProduct(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None


supabaseUrl = "https://cvuiuqgykwoicwpavhrs.supabase.co"
supabaseKey = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url=supabaseUrl, supabase_key=supabaseKey)


@router.post("/create")
async def create_product(post: PostProduct, image: Optional[UploadFile] = File(None)):
    product_data = post.dict()
    if image:
        try:
            filename = f"{uuid.uuid4()}-{image.filename}"
            file_path = f"temp/{filename}"

            with open(file_path, "wb+") as file_object:
                file_object.write(await image.read())

            bucket_name = "images"
            storage_path = f"products/{filename}"
            response = supabase.storage().from_(bucket_name).upload(storage_path, file_path)

            if response.status_code == 200:
                image_url = supabase.storage().from_(bucket_name).get_public_url(storage_path).data.get('publicURL')

                product_data['image'] = image_url
            else:
                raise HTTPException(status_code=500, detail="Failed to upload image")

            os.remove(file_path)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {e}")

    data, count = supabase.table('products').insert(product_data).execute()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to insert product data")

    return JSONResponse(content=data)


@router.get("/all")
async def all_products(response: Response):
    try:
        data = supabase.table('products').select('*').execute()
        if not data.data:
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return {"detail": str(data.error)}
        return data.data
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.put("/update/{product_id}")
async def update_product(product_id: int, post: UpdateProduct, response: Response):
    try:
        exists = supabase.table('products').select('*').eq('id', product_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {product_id} not found")

        update_data = {k: v for k, v in post.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields provided for update")

        updated = supabase.table('products').update(update_data).eq('id', product_id).execute()

        if not updated.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(updated.error))

        return updated.data
    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.delete("/delete/{product_id}")
async def delete_product(product_id: int, response: Response):
    try:
        exists = supabase.table('products').select('*').eq('id', product_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {product_id} not found")

        deleted = supabase.table('products').delete().eq('id', product_id).execute()

        if not deleted.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(deleted.error))

        response.status_code = status.HTTP_204_NO_CONTENT
        return {"detail": f"Product with ID {product_id} successfully deleted"}
    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}

