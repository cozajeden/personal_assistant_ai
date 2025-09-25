import dotenv
import logging
import os

dotenv.load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
ALLOWED_ORIGINS = os.getenv("FASTAPI_ALLOWED_ORIGINS")
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
stream_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logging.getLogger("uvicorn.access").addHandler(stream_handler)
logging.getLogger("uvicorn.error").addHandler(stream_handler)
logging.getLogger("fastapi").addHandler(stream_handler)
logging.getLogger("sqlalchemy").addHandler(stream_handler)
logging.getLogger("alembic").addHandler(stream_handler)
logging.getLogger("ollama").addHandler(stream_handler)
logging.getLogger("ollama.server").addHandler(stream_handler)
