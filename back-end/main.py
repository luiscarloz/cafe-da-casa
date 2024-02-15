from fastapi import FastAPI, status, Response, HTTPException
from routers import product_router

app = FastAPI()

app.include_router(product_router.router)


def home():
    return {"message": "You are in our home page, head to /docs to see API's documentation"}
