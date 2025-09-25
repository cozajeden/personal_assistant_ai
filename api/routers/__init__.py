from .models import routers as models_routers
from .ws import routers as ws_routers

routers = [
    models_routers.router,
    ws_routers.router,
]