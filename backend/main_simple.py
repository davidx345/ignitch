from fastapi import FastAPI
import os

# Simple FastAPI app for Railway deployment
app = FastAPI(
    title="Ignitch API",
    description="Social Media Management Platform",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "Ignitch API is running!", 
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "message": "API is healthy"}

@app.get("/test")
async def test():
    return {"message": "Test endpoint working", "port": os.getenv("PORT", "unknown")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
