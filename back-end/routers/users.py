from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import datetime
import os

load_dotenv()

supabaseUrl = "https://cvuiuqgykwoicwpavhrs.supabase.co"
supabaseKey = os.environ.get("SUPABASE_KEY")

supabase = create_client(supabase_url=supabaseUrl, supabase_key=supabaseKey)
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


class PostUsers(BaseModel):
    name: str
    whatsapp: int
    birthday: datetime.date


@router.post("/create")
async def create_user(post: PostUsers, response: Response):
    data = post.dict()
    data['birthday'] = data['birthday'].isoformat()
    try:
        exists = await supabase.table('users').select('*').eq('whatsapp', data['whatsapp']).execute()
        if not exists.data:
            user = await supabase.table('users').insert(data).execute()
            return user.data[0]
        else:
            return exists.data[0]
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}
