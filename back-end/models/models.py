from pydantic import BaseModel


class PostProduct(BaseModel):
    name: str
    category: str
    quantity: int
    price: float

