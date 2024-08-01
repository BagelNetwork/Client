from abc import abstractmethod
from typing import Dict, Type
from overrides import overrides, EnforceOverrides


class BagelError(Exception, EnforceOverrides):
    def code(self) -> int:
        """Return an appropriate HTTP response code for this error"""
        return 400  # Bad Request

    def message(self) -> str:
        return ", ".join(self.args)

    @classmethod
    @abstractmethod
    def name(self) -> str:
        """Return the error name"""
        pass


class DuplicateIDError(BagelError):
    @classmethod
    @overrides
    def name(cls) -> str:
        return "DuplicateID"


error_types: Dict[str, Type[BagelError]] = {
    "DuplicateID": DuplicateIDError,
}
