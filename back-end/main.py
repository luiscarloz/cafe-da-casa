from fastapi import FastAPI, status, Response, HTTPException
from routers import products

app = FastAPI()

app.include_router(products.router)


@app.get('/')
def home():
    return {"message": "You are in our home page, head to /docs to see API's documentation"}
