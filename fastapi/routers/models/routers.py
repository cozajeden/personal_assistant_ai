from fastapi import APIRouter
from .update_models import update_list


router = APIRouter()

router.post("/update_list")(update_list)
