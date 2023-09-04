from typing import Optional, cast, Any
from bagel.api import API
from bagel.config import System
from bagel.api.types import (
    Document,
    Documents,
    Embeddings,
    IDs,
    Include,
    Metadatas,
    Metadata,
    Where,
    WhereDocument,
    GetResult,
    QueryResult,
    ClusterMetadata,
    OneOrMany,
)
import pandas as pd
import requests
import json
from typing import Sequence, Dict
from bagel.api.Cluster import Cluster
import bagel.errors as errors
from uuid import UUID
from overrides import override
import base64
from io import BytesIO
import os
import uuid

class FastAPI(API):
    def __init__(self, system: System):
        super().__init__(system)
        url_prefix = "https" if system.settings.bagel_server_ssl_enabled else "http"
        system.settings.require("bagel_server_host")
        if system.settings.bagel_server_http_port:
            self._api_url = f"{url_prefix}://{system.settings.bagel_server_host}:{system.settings.bagel_server_http_port}/api/v1"
        else:
            self._api_url = f"{url_prefix}://{system.settings.bagel_server_host}/api/v1"

    @override
    def ping(self) -> int:
        """Returns the current server time in nanoseconds to check if the server is alive"""
        resp = requests.get(self._api_url)
        raise_bagel_error(resp)
        return int(resp.json()["nanosecond heartbeat"])

    @override
    def join_waitlist(self, email: str) -> Dict[str, str]:
        """Add email to waitlist"""
        url = self._api_url.replace("/api/v1", "")
        resp = requests.get(url + "/join_waitlist/" + email, timeout=60)
        return resp.json()

    @override
    def get_all_clusters(self) -> Sequence[Cluster]:
        """Returns a list of all clusters"""
        resp = requests.get(self._api_url + "/clusters")
        raise_bagel_error(resp)
        json_clusters = resp.json()
        clusters = []
        for json_cluster in json_clusters:
            clusters.append(Cluster(self, **json_cluster))

        return clusters

    @override
    def create_cluster(
        self,
        name: str,
        metadata: Optional[ClusterMetadata] = None,
        get_or_create: bool = False,
    ) -> Cluster:
        """Creates a cluster"""
        resp = requests.post(
            self._api_url + "/clusters",
            data=json.dumps(
                {"name": name, "metadata": metadata, "get_or_create": get_or_create}
            ),
        )
        raise_bagel_error(resp)
        resp_json = resp.json()
        return Cluster(
            client=self,
            id=resp_json["id"],
            name=resp_json["name"],
            metadata=resp_json["metadata"],
        )

    @override
    def get_cluster(
        self,
        name: str,
    ) -> Cluster:
        """Returns a cluster"""
        resp = requests.get(self._api_url + "/clusters/" + name)
        raise_bagel_error(resp)
        resp_json = resp.json()
        return Cluster(
            client=self,
            name=resp_json["name"],
            id=resp_json["id"],
            metadata=resp_json["metadata"],
        )

    @override
    def get_or_create_cluster(
        self,
        name: str,
        metadata: Optional[ClusterMetadata] = None,
    ) -> Cluster:
        """Get a cluster, or return it if it exists"""

        return self.create_cluster(
            name, metadata, get_or_create=True
        )

    @override
    def _modify(
        self,
        id: UUID,
        new_name: Optional[str] = None,
        new_metadata: Optional[ClusterMetadata] = None,
    ) -> None:
        """Updates a cluster"""
        resp = requests.put(
            self._api_url + "/clusters/" + str(id),
            data=json.dumps({"new_metadata": new_metadata, "new_name": new_name}),
        )
        raise_bagel_error(resp)

    @override
    def delete_cluster(self, name: str) -> None:
        """Deletes a cluster"""
        resp = requests.delete(self._api_url + "/clusters/" + name)
        raise_bagel_error(resp)

    @override
    def _count(self, cluster_id: UUID) -> int:
        """Returns the number of embeddings in the database"""
        resp = requests.get(self._api_url + "/clusters/" + str(cluster_id) + "/count")
        raise_bagel_error(resp)
        return cast(int, resp.json())

    @override
    def _peek(self, cluster_id: UUID, n: int = 10) -> GetResult:
        return self._get(
            cluster_id,
            limit=n,
            include=["embeddings", "documents", "metadatas"],
        )

    @override
    def _get(
        self,
        cluster_id: UUID,
        ids: Optional[IDs] = None,
        where: Optional[Where] = {},
        sort: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        page: Optional[int] = None,
        page_size: Optional[int] = None,
        where_document: Optional[WhereDocument] = {},
        include: Include = ["metadatas", "documents"],
    ) -> GetResult:
        """Gets embeddings from the database"""
        if page and page_size:
            offset = (page - 1) * page_size
            limit = page_size

        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/get",
            data=json.dumps(
                {
                    "ids": ids,
                    "where": where,
                    "sort": sort,
                    "limit": limit,
                    "offset": offset,
                    "where_document": where_document,
                    "include": include,
                }
            ),
        )

        raise_bagel_error(resp)
        body = resp.json()
        return GetResult(
            ids=body["ids"],
            embeddings=body.get("embeddings", None),
            metadatas=body.get("metadatas", None),
            documents=body.get("documents", None),
        )

    @override
    def _delete(
        self,
        cluster_id: UUID,
        ids: Optional[IDs] = None,
        where: Optional[Where] = {},
        where_document: Optional[WhereDocument] = {},
    ) -> IDs:
        """Deletes embeddings from the database"""

        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/delete",
            data=json.dumps(
                {"where": where, "ids": ids, "where_document": where_document}
            ),
        )

        raise_bagel_error(resp)
        return cast(IDs, resp.json())

    @override
    def _add_image(self, cluster_id: UUID, filename: str, metadata: Optional[Metadata] = None) -> Any:
        """
        Add an image to the BagelDB.

        Args:
            cluster_id (UUID):
                The UUID of the cluster to which the image should be added.
            filename (str):
                The path to the image file to be added.

        Returns:
            Any:
                The response from the API call.

        Raises:
            Exception:
                Raises an exception if there's an issue with the API call.

        Note:
            This method reads the image file, encodes it in base64, and sends
            the image along with metadata to the BagelDB API for addition to
            the specified cluster.
        """
        image_name = os.path.basename(filename)
        uid = str(uuid.uuid4())
        with open(filename, "rb") as i:
            image_data = base64.b64encode(i.read())

        if metadata is None:
            metadata = {"filename": str(image_name)}
        data = {
            "metadata": [metadata],
            "ids": [uid],
            "increment_index": True,
        }
        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/add_image",
            files={
                "image": (str(image_name), image_data, "image/jpeg"),
                "data": (None, json.dumps(data), "application/json"),
            },
        )
        raise_bagel_error(resp)
        return resp

    @override
    def _add(
        self,
        ids: IDs,
        cluster_id: UUID,
        embeddings: Optional[Embeddings] = None,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
        increment_index: bool = True,
    ) -> bool:
        """
        Adds a batch of embeddings to the database
        - pass in column oriented data lists
        - by default, the index is progressively built up as you add more data. If for ingestion performance reasons you want to disable this, set increment_index to False
        -     and then manually create the index yourself with cluster.create_index()
        """
        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/add",
            data=json.dumps(
                {
                    "ids": ids,
                    "embeddings": embeddings,
                    "metadatas": metadatas,
                    "documents": documents,
                    "increment_index": increment_index,
                }
            ),
        )

        raise_bagel_error(resp)
        return True

    @override
    def _update(
        self,
        cluster_id: UUID,
        ids: IDs,
        embeddings: Optional[Embeddings] = None,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
    ) -> bool:
        """
        Updates a batch of embeddings in the database
        - pass in column oriented data lists
        """

        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/update",
            data=json.dumps(
                {
                    "ids": ids,
                    "embeddings": embeddings,
                    "metadatas": metadatas,
                    "documents": documents,
                }
            ),
        )

        resp.raise_for_status()
        return True

    @override
    def _upsert(
        self,
        cluster_id: UUID,
        ids: IDs,
        embeddings: Optional[Embeddings] = None,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
        increment_index: bool = True,
    ) -> bool:
        """
        Updates a batch of embeddings in the database
        - pass in column oriented data lists
        """

        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/upsert",
            data=json.dumps(
                {
                    "ids": ids,
                    "embeddings": embeddings,
                    "metadatas": metadatas,
                    "documents": documents,
                    "increment_index": increment_index,
                }
            ),
        )

        resp.raise_for_status()
        return True

    @override
    def _query(
        self,
        cluster_id: UUID,
        query_embeddings: Embeddings,
        n_results: int = 10,
        where: Optional[Where] = {},
        where_document: Optional[WhereDocument] = {},
        include: Include = ["metadatas", "documents", "distances"],
        query_texts: Optional[OneOrMany[Document]] = None,
    ) -> QueryResult:
        """Gets the nearest neighbors of a single embedding"""
        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/query",
            data=json.dumps(
                {
                    "query_embeddings": query_embeddings,
                    "n_results": n_results,
                    "where": where,
                    "where_document": where_document,
                    "include": include,
                    "query_texts": query_texts,
                }
            ),
        )

        raise_bagel_error(resp)
        body = resp.json()

        return QueryResult(
            ids=body["ids"],
            distances=body.get("distances", None),
            embeddings=body.get("embeddings", None),
            metadatas=body.get("metadatas", None),
            documents=body.get("documents", None),
        )

    @override
    def reset(self) -> None:
        """Resets the database"""
        resp = requests.post(self._api_url + "/reset")
        raise_bagel_error(resp)

    @override
    def persist(self) -> bool:
        """Persists the database"""
        resp = requests.post(self._api_url + "/persist")
        raise_bagel_error(resp)
        return cast(bool, resp.json())

    # @override
    # def raw_sql(self, sql: str) -> pd.DataFrame:
    #     """Runs a raw SQL query against the database"""
    #     resp = requests.post(
    #         self._api_url + "/raw_sql", data=json.dumps({"raw_sql": sql})
    #     )
    #     raise_bagel_error(resp)
    #     return pd.DataFrame.from_dict(resp.json())

    @override
    def create_index(self, cluster_name: str) -> bool:
        """Creates an index for the given space key"""
        resp = requests.post(
            self._api_url + "/clusters/" + cluster_name + "/create_index"
        )
        raise_bagel_error(resp)
        return cast(bool, resp.json())

    @override
    def get_version(self) -> str:
        """Returns the version of the server"""
        resp = requests.get(self._api_url + "/version")
        raise_bagel_error(resp)
        return cast(str, resp.json())


def raise_bagel_error(resp: requests.Response) -> None:
    """Raises an error if the response is not ok, using a BagelError if possible"""
    if resp.ok:
        return

    bagel_error = None
    try:
        body = resp.json()
        if "error" in body:
            if body["error"] in errors.error_types:
                bagel_error = errors.error_types[body["error"]](body["message"])

    except BaseException:
        pass

    if bagel_error:
        raise bagel_error

    try:
        resp.raise_for_status()
    except requests.HTTPError:
        raise (Exception(resp.text))
