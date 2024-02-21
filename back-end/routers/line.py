import asyncio
from fastapi import APIRouter, Response, status, HTTPException
from pydantic import BaseModel
from supabase import create_client
import requests
from dotenv import load_dotenv
import os

load_dotenv()

supabaseUrl = "https://cvuiuqgykwoicwpavhrs.supabase.co"
supabaseKey = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url=supabaseUrl, supabase_key=supabaseKey)
router = APIRouter(
    prefix="/line",
    tags=["Line"]
)


@router.get("/all")
async def get_line():
    line = supabase.table('orders').select('created_at, user_id, pay_status, order_status, users(name)').eq(
        'order_status', 'pending'
    ).execute()
    return line.data, status.HTTP_200_OK


@router.post("/call_client/{user_id}")
async def call_client(user_id: int):
    def remove_ninth_digit(phone):
        phone_number = phone
        number_str = str(phone_number)
        if len(number_str) > 10 and number_str[2] == '9':
            phone_number = number_str[:2] + number_str[3:]

        return phone_number

    try:
        user_data = get_user_data(user_id)
        orders_data = get_pending_orders(user_data.data[0]['id'])

        whatsapp = remove_ninth_digit(user_data.data[0]['whatsapp'])
        username = user_data.data[0]['name'] if user_data.data[0]['name'] else ""

        headers = {
            "Authorization": "Bearer " + os.environ.get("WAAPI_TOKEN"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        payload = {
            "chatId": f"55{whatsapp}@c.us",
            "message": f"Olá {username}, seu pedido está pronto"
        }
        endpoint = 'https://waapi.app/api/v1/instances/5384/client/action/send-message'

        while True:  # Runs until the message is sent
            waapi_response = requests.post(endpoint, payload, headers)
            waapi_response = waapi_response.json()

            if waapi_response.get("status") == "success":
                complete_order(orders_data.data[0]['id'])
                return {"status": "success"}, status.HTTP_201_CREATED

            await asyncio.sleep(2)

    except Exception as e:
        # Handle exceptions appropriately (e.g., log the error)
        return {"status": "error", "error_message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR


# Helper functions
def get_user_data(user_id):
    data = supabase.table('users').select('name, whatsapp').eq('id', user_id).execute()
    data = data.data[0]
    if not data.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
    return data


def get_pending_orders(user_id):
    data = supabase.table('orders').select('created_at, user_id, orders_status').eq('user_id', user_id).eq(
        'order_status', 'pending').execute()
    data = data.data[0]
    if not data.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
    return data


def complete_order(order_id):
    updated = supabase.table('orders').update({'order_status': 'completed'}).eq('order_id', order_id).execute()
    if not updated.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with ID {order_id} not found")

