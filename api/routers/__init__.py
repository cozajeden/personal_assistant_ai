from .models import routers as models_routers
from .ws import routers as ws_routers
from .conversations import routers as conversations_routers

routers = [
    models_routers.router,
    ws_routers.router,
    conversations_routers.router,
]