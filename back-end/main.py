from fastapi import FastAPI
from routers import products, users, orders, line

app = FastAPI()

app.include_router(products.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(line.router)


@app.get('/')
def home():
    return {"message": "You are in our home page, head to /docs to see API's documentation"}
