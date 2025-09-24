from fastapi import APIRouter
from .update_models import router as update_models_router
from .show_models import router as show_models_router

router = APIRouter(prefix="/models", tags=["models"])

router.include_router(update_models_router, tags=["update"])
router.include_router(show_models_router, tags=["get"])
