from fastapi import APIRouter, Response, status, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from typing import List, Optional
import os

load_dotenv()

supabaseUrl = "https://cvuiuqgykwoicwpavhrs.supabase.co"
supabaseKey = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url=supabaseUrl, supabase_key=supabaseKey)
router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


class PostDetail(BaseModel):
    product_id: int
    quantity: int
    price: float


class PostOrder(BaseModel):
    user_id: int
    payment_status: str
    order_status: str
    order_details: List[PostDetail]

class UpdateOrder(BaseModel):
    payment_status: Optional[str] = None
    order_status: Optional[str] = None


@router.post("/create")
async def create_order(post: PostOrder):
    order_data = {
        "user_id": post.user_id,
        "total": sum(float(detail.price) * int(detail.quantity) for detail in post.order_details),
        "payment_status": post.payment_status,
        "order_status": post.order_status
    }
    order = await supabase.table("orders").upsert(order_data).execute()
    if not order.data:
        raise HTTPException(status_code=500, detail="Failed to create order")

    order_id = order.data["data"][0]["id"]

    order_details_data = [
        {
            "product_id": detail.product_id,
            "quantity": detail.quantity,
            "price": detail.price,
            "order_id": order_id,
        }
        for detail in post.order_details
    ]
    order_detail_response = await supabase.table("order_details").upsert(order_details_data).execute()

    if not order_detail_response.data:
        await supabase.table("orders").delete().eq("id", order_id).execute()
        raise HTTPException(status_code=500, detail="Failed to create order details")

    return {"order_id": order_id, "message": "Order created successfully"}, status.HTTP_201_CREATED


@router.get("/all")
async def list_orders():
    data = await supabase.table("orders").select("*").execute()

    if not data.data:
        raise HTTPException(status_code=500, detail="Failed to retrieve orders data")
    else:
        return data.data, status.HTTP_200_OK


@router.get("/{order_id}")
async def get_order(order_id: int, response: Response):
    try:
        exists = await supabase.table('orders').select('*').eq('id', order_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {order_id} not found")

        order_details = await supabase.table('order_details').select('*').eq('order_id', order_id).execute()

        response_data = {
            "order_id": order_id,
            "price": exists.data[0]["total"],
            "pay_status": exists.data[0]["pay_status"],
            "order_status": exists.data[0]["order_status"],
            "detail_id": exists.data[0]["detail_id"],
            "details": [{
                "product_id": detail['product_id'],
                "quantity": detail['quantity']
            } for detail in order_details.data]
        }

        return response_data, status.HTTP_200_OK

    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.put("/update/{order_id}")
async def update_order(order_id: int, post: UpdateOrder, response: Response):
    order_id = order_id
    try:
        update_data = {k: v for k, v in post.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields provided for update")

        updated = await supabase.table('orders').update(update_data).eq('id', order_id).execute()

        if not updated.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(updated.error))

        return updated.data
    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}

