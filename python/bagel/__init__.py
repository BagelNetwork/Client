import logging
from bagel.config import Settings, System
from bagel.api import API

logger = logging.getLogger(__name__)

def Client(settings: Settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai",
    )) -> API:
    """Return a running bagel.API instance"""
    system = System(settings)
    api = system.instance(API)
    return api
