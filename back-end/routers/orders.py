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
    pay_status: str
    order_details: List[PostDetail]


class UpdateOrder(BaseModel):
    order_id: int
    pay_status: Optional[str] = None
    order_status: Optional[str] = None
    price: Optional[str] = None
    order_details: Optional[List[PostDetail]] = None


@router.post("/create")
async def create_order(post: PostOrder):
    order_data = {
        "user_id": post.user_id,
        "total": sum(detail.price * detail.quantity for detail in post.order_details),
        "pay_status": post.pay_status,
        "order_status": 'pending'
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

    return {"order_id": order_id, "message": "Order created successfully"}


@router.get("/all")
async def list_orders():
    data = await supabase.table("orders").select("*").execute()

    if not data.data:
        raise HTTPException(status_code=500, detail="Failed to retrieve orders data")
    else:
        return data.data


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

        return response_data

    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}


@router.put("/update/{order_id}")
async def update_order(post: UpdateOrder, response: Response):
    order_id = post.order_id
    try:
        exists = await supabase.table('orders').select('*').eq('id', order_id).execute()
        if not exists.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {order_id} not found")

        updated_data = {k: v for k, v in post.dict(exclude={'order_details'}).items() if v is not None}

        if updated_data:
            await supabase.table('orders').update(updated_data).eq('id', order_id).execute()
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"No valid fields provided for update")

        if post.order_details:
            order_details_data = [
                {
                    "product_id": detail.product_id,
                    "quantity": detail.quantity,
                    "price": detail.price,
                    "order_id": order_id,
                }
                for detail in post.order_details
            ]

            await supabase.table('order_details').upsert(order_details_data).execute()

        return status.HTTP_200_OK

    except HTTPException as e:
        response.status_code = e.status_code
        return {"detail": e.detail}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}
