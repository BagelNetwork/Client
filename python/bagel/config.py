from pydantic import BaseSettings
from typing import Optional, List, Any, Dict, TypeVar, Set, cast, Iterable, Type
from typing_extensions import Literal
from abc import ABC
import importlib
import logging
from overrides import EnforceOverrides, override
from graphlib import TopologicalSorter
import inspect

# The thin client will have a flag to control which implementations to use
is_thin_client = False
try:
    from bagel.is_thin_client import is_thin_client
except ImportError:
    is_thin_client = False


logger = logging.getLogger(__name__)

_legacy_config_values = {
    "rest": "bagel.api.fastapi.FastAPI",
}

_abstract_type_keys: Dict[str, str] = {
    "bagel.api.API": "bagel_api_impl",
}


class Settings(BaseSettings):
    environment: str = ""
    bagel_api_impl: str = "bagel.api.fastapi.FastAPI"

    clickhouse_host: Optional[str] = None
    clickhouse_port: Optional[str] = None

    persist_directory: str = ".bagel"

    bagel_server_host: Optional[str] = None
    bagel_server_http_port: Optional[str] = None
    bagel_server_ssl_enabled: Optional[bool] = False
    bagel_server_grpc_port: Optional[str] = None
    bagel_server_cors_allow_origins: List[str] = []
    anonymized_telemetry: bool = True

    allow_reset: bool = False

    sqlite_database: Optional[str] = ":memory:"
    migrations: Literal["none", "validate", "apply"] = "apply"

    def require(self, key: str) -> Any:
        """Return the value of a required config key, or raise an exception if it is not
        set"""
        val = self[key]
        if val is None:
            raise ValueError(f"Missing required config value '{key}'")
        return val

    def __getitem__(self, key: str) -> Any:
        val = getattr(self, key)
        # Backwards compatibility with short names instead of full class names
        if val in _legacy_config_values:
            newval = _legacy_config_values[val]
            val = newval
        return val

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


T = TypeVar("T", bound="Component")


class Component(ABC, EnforceOverrides):
    _dependencies: Set["Component"]
    _system: "System"
    _running: bool

    def __init__(self, system: "System"):
        self._dependencies = set()
        self._system = system
        self._running = False

    def require(self, type: Type[T]) -> T:
        """Get a Component instance of the given type, and register as a dependency of
        that instance."""
        inst = self._system.instance(type)
        self._dependencies.add(inst)
        return inst

    def dependencies(self) -> Set["Component"]:
        """Return the full set of components this component depends on."""
        return self._dependencies

    def stop(self) -> None:
        """Idempotently stop this component's execution and free all associated
        resources."""
        self._running = False

    def start(self) -> None:
        """Idempotently start this component's execution"""
        self._running = True

    def reset(self) -> None:
        """Reset this component's state to its initial blank state. Only intended to be
        called from tests."""
        pass


class System(Component):
    settings: Settings

    _instances: Dict[Type[Component], Component]

    def __init__(self, settings: Settings):
        self.settings = settings
        self._instances = {}
        super().__init__(self)

        if is_thin_client:
            # The thin client is a system with only the API component
            if self.settings["bagel_api_impl"] != "bagel.api.fastapi.FastAPI":
                raise RuntimeError(
                    "Bagel is running in http-only client mode, and can only be run with 'bagel.api.fastapi.FastAPI' or 'rest' as the bagel_api_impl."
                )

    def instance(self, type: Type[T]) -> T:
        """Return an instance of the component type specified. If the system is running,
        the component will be started as well."""

        if inspect.isabstract(type):
            type_fqn = get_fqn(type)
            if type_fqn not in _abstract_type_keys:
                raise ValueError(f"Cannot instantiate abstract type: {type}")
            key = _abstract_type_keys[type_fqn]
            fqn = self.settings.require(key)
            type = get_class(fqn, type)

        if type not in self._instances:
            impl = type(self)
            self._instances[type] = impl
            if self._running:
                impl.start()

        inst = self._instances[type]
        return cast(T, inst)

    def components(self) -> Iterable[Component]:
        """Return the full set of all components and their dependencies in dependency
        order."""
        sorter: TopologicalSorter[Component] = TopologicalSorter()
        for component in self._instances.values():
            sorter.add(component, *component.dependencies())

        return sorter.static_order()

    @override
    def start(self) -> None:
        super().start()
        for component in self.components():
            component.start()

    @override
    def stop(self) -> None:
        super().stop()
        for component in reversed(list(self.components())):
            component.stop()

    @override
    def reset(self) -> None:
        if not self.settings.allow_reset:
            raise ValueError("Resetting is not allowed by this configuration")
        for component in self.components():
            component.reset()


C = TypeVar("C")


def get_class(fqn: str, type: Type[C]) -> Type[C]:
    """Given a fully qualifed class name, import the module and return the class"""
    module_name, class_name = fqn.rsplit(".", 1)
    module = importlib.import_module(module_name)
    cls = getattr(module, class_name)
    return cast(Type[C], cls)


def get_fqn(cls: Type[object]) -> str:
    """Given a class, return its fully qualified name"""
    return f"{cls.__module__}.{cls.__name__}"
