import bagel.config
import logging
from bagel.config import Settings, System
from bagel.api import API

logger = logging.getLogger(__name__)

__settings = Settings()

__version__ = "0.3.26"


def configure(**kwargs) -> None:  # type: ignore
    """Override Bagel's default settings, environment variables or .env files"""
    global __settings
    __settings = bagel.config.Settings(**kwargs)


def get_settings() -> Settings:
    return __settings


def Client(settings: Settings = __settings) -> API:
    """Return a running bagel.API instance"""
    system = System(settings)
    api = system.instance(API)
    return api
