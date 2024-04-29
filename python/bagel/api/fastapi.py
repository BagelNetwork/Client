from typing import Optional, cast, Any, List, Tuple
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
import time

import tempfile, zipfile

BAGEL_USER_ID = "BAGEL_USER_ID"
BAGEL_API_KEY = "BAGEL_API_KEY"

X_API_KEY = 'x-api-key'

DEFAULT_TENANT = "default_tenant"
DEFAULT_DATABASE = "default_database"


class FastAPI(API):
    def __init__(self, system: System):
        super().__init__(system)
        url_prefix = "https" if system.settings.bagel_server_ssl_enabled else "http"
        self.__headers = {"bagel_source": system.settings.bagel_source}
        system.settings.require("bagel_server_host")
        if system.settings.bagel_server_http_port:
            self._api_url = f"{url_prefix}://{system.settings.bagel_server_host}:{system.settings.bagel_server_http_port}/api/v1"
        else:
            self._api_url = f"{url_prefix}://{system.settings.bagel_server_host}/api/v1"

    @override
    def ping(self) -> int:
        """Returns the current server time in nanoseconds to check if the server is alive"""
        resp = requests.get(self._api_url, headers=self.__headers)
        raise_bagel_error(resp)
        return int(resp.json()["nanosecond heartbeat"])

    @override
    def join_waitlist(self, email: str) -> Dict[str, str]:
        """Add email to waitlist"""
        url = self._api_url.replace("/api/v1", "")
        resp = requests.get(url + "/join_waitlist/" + email, timeout=60)
        return resp.json()

    @override
    def get_all_clusters(self, user_id: str = DEFAULT_TENANT, api_key: Optional[str] = None) -> Sequence[Cluster]:
        """Returns a list of all clusters"""
        headers, user_id = self._extract_headers_with_key_and_user_id(api_key, user_id)
        resp = requests.get(self._api_url + "/clusters", headers=headers, params={"user_id": user_id});
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
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None,
            embedding_model: Optional[str] = None,
            dimension: Optional[int] = None
    ) -> Cluster:
        """Creates a cluster"""
        headers, user_id = self._extract_headers_with_key_and_user_id(api_key, user_id)
        resp = requests.post(
            self._api_url + "/clusters",
            data=json.dumps(
                {"name": name, "metadata": metadata, "get_or_create": get_or_create,
                 "user_id": user_id, "embedding_model": embedding_model, "dimensions": dimension}
            ),
            headers=headers
        )
        raise_bagel_error(resp)
        resp_json = resp.json()
        return Cluster(
            client=self,
            id=resp_json["id"],
            name=resp_json["name"],
            metadata=resp_json["metadata"],
            cluster_size=resp_json["cluster_size"],
            embedding_size=resp_json["embedding_size"]
        )

    @override
    def get_cluster(
            self,
            name: str,
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None
    ) -> Cluster:
        """Returns a cluster"""
        headers, user_id = self._extract_headers_with_key_and_user_id(api_key, user_id)
        url = f"{self._api_url}/clusters/{name}"
        resp = requests.get(url, headers=headers, params={
            "user_id": user_id
        })
        raise_bagel_error(resp)
        resp_json = resp.json()
        return Cluster(
            client=self,
            name=resp_json["name"],
            id=resp_json["id"],
            metadata=resp_json["metadata"],
            cluster_size=resp_json["cluster_size"],
            embedding_size=resp_json["embedding_size"],
        )

    @override
    def get_or_create_cluster(
            self,
            name: str,
            metadata: Optional[ClusterMetadata] = None,
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None,
            embedding_model: Optional[str] = None,
            dimension: Optional[int] = None
    ) -> Cluster:
        """Get a cluster, or return it if it exists"""
        return self.create_cluster(name, metadata, get_or_create=True, api_key=api_key,
                                   embedding_model=embedding_model, dimension=dimension)

    @override
    def _modify(
            self,
            id: UUID,
            new_name: Optional[str] = None,
            new_metadata: Optional[ClusterMetadata] = None,
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None
    ) -> None:
        """Updates a cluster"""
        headers = self._popuate_headers_with_api_key(api_key)
        resp = requests.put(
            self._api_url + "/clusters/" + str(id),
            data=json.dumps({"new_metadata": new_metadata, "new_name": new_name}),
            headers=headers
        )
        raise_bagel_error(resp)

    @override
    def delete_cluster(self, name: str,
                       user_id: str = DEFAULT_TENANT,
                       api_key: Optional[str] = None) -> None:
        """Deletes a cluster"""
        headers, user_id = self._extract_headers_with_key_and_user_id(api_key, user_id)
        url = f"{self._api_url}/clusters/{name}?user_id={user_id}"
        resp = requests.delete(url, headers=headers)
        raise_bagel_error(resp)

    @override
    def _count(self, cluster_id: UUID,
               api_key: Optional[str] = None) -> int:
        """Returns the number of embeddings in the database"""
        headers = self._popuate_headers_with_api_key(api_key)
        resp = requests.get(self._api_url + "/clusters/" + str(cluster_id) + "/count", headers=headers)
        raise_bagel_error(resp)
        return cast(int, resp.json())

    @override
    def _peek(self, cluster_id: UUID, n: int = 10,
              api_key: Optional[str] = None) -> GetResult:
        return self._get(
            cluster_id,
            limit=n,
            include=["embeddings", "documents", "metadatas"]
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
            api_key: Optional[str] = None
    ) -> GetResult:
        """Gets embeddings from the database"""
        headers = self._popuate_headers_with_api_key(api_key)
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
            headers=headers
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
            api_key: Optional[str] = None
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
    def _add_image(
            self, cluster_id: UUID, filename: str, metadata: Optional[Metadata] = None,
            api_key: Optional[str] = None
    ) -> Any:
        """
        Add an image to the Bagel.

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
            the image along with metadata to the Bagel API for addition to
            the specified cluster.
        """
        headers = self._popuate_headers_with_api_key(api_key)
        image_name = os.path.basename(filename)
        uid = str(uuid.uuid4())
        with open(filename, "rb") as i:
            image_data = base64.b64encode(i.read()).decode('utf-8')

        if metadata is None:
            metadata = {"filename": str(image_name)}
        data = json.dumps({
            "metadatas": [metadata],
            "ids": [uid],
            "increment_index": True,
            "documents": [image_data]
        })
        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/add_image",
            data=data,
            headers=headers
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
            api_key: Optional[str] = None
    ) -> bool:
        """
        Adds a batch of embeddings to the database
        - pass in column oriented data lists
        - by default, the index is progressively built up as you add more data. If for ingestion performance reasons you want to disable this, set increment_index to False
        -     and then manually create the index yourself with cluster.create_index()
        """
        headers = self._popuate_headers_with_api_key(api_key)
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
            headers=headers
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
            api_key: Optional[str] = None
    ) -> bool:
        """
        Updates a batch of embeddings in the database
        - pass in column oriented data lists
        """
        headers = self._popuate_headers_with_api_key(api_key)
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
            headers=headers
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
            api_key: Optional[str] = None
    ) -> bool:
        """
        Updates a batch of embeddings in the database
        - pass in column oriented data lists
        """
        
        headers = self._popuate_headers_with_api_key(api_key)

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
            headers = headers
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
            api_key: Optional[str] = None
    ) -> QueryResult:
        """Gets the nearest neighbors of a single embedding"""
        headers = self._popuate_headers_with_api_key(api_key)
        
        max_retries = 3
        retry_delay = 1  # in seconds
        
        for attempt in range(max_retries):
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
                headers=headers
            )
            
            if resp.ok:
                break
            elif attempt < max_retries - 1:
                time.sleep(retry_delay)
        
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
        resp = requests.get(self._api_url + "/version", headers=self.__headers)
        raise_bagel_error(resp)
        return cast(str, resp.json())

    @override
    def share_cluster(self, cluster_id: str, usernames: List[str]):

        headers = self._popuate_headers_with_api_key(None)

        resp = requests.post(
            self._api_url + "/share-cluster",
            data=json.dumps(
                {
                    "cluster_id": cluster_id,
                    "user_names": usernames
                }
            ),
            headers=headers
        )

        raise_bagel_error(resp)
        return resp.json()

    @override
    def _add_image_urls(
            self,
            cluster_id: UUID,
            ids: IDs,
            urls: List[str],
            metadatas: Optional[Metadatas] = None,
            increment_index: bool = True,
    ) -> Any:
        headers = self._popuate_headers_with_api_key(None)
        """Add image by urls to Bagel."""
        if metadatas is None:
            metadatas = [{"url": str(url)} for url in urls]

        resp = requests.post(
            self._api_url + "/clusters/" + str(cluster_id) + "/add_image_url",
            data=json.dumps(
                {
                    "ids": ids,
                    "image_urls": urls,
                    "metadatas": metadatas,
                    "increment_index": increment_index,
                }
            ),
            headers=headers
        )

        raise_bagel_error(resp)
        return resp.json()

    def _extract_headers_with_key_and_user_id(self, api_key, user_id):
        api_key, user_id = self._extract_user_id_and_api_key(api_key, user_id)
        headers = self._popuate_headers_with_api_key(api_key)
        return headers, user_id

    def _popuate_headers_with_api_key(self, api_key):
        headers = self.__headers.copy()  # Make a copy of headers to avoid modifying original headers
        if os.environ.get(BAGEL_API_KEY) is not None and api_key is None:
            api_key = os.environ.get(BAGEL_API_KEY)
        headers[X_API_KEY] = api_key  # Add API key to headers
        return headers

    def _extract_user_id_and_api_key(self, api_key, user_id):
        if os.environ.get(BAGEL_USER_ID) is not None and user_id == DEFAULT_TENANT:
            user_id = os.environ.get(BAGEL_USER_ID)
        if os.environ.get(BAGEL_API_KEY) is not None and api_key is None:
            api_key = os.environ.get(BAGEL_API_KEY)
        return api_key, user_id
    
    @override
    def create_dataset(
            self,
            dataset_id: UUID,
            name: str,
            description: str,
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None
    ) -> str:
        """Create a dataset"""
        headers, user_id = self._extract_headers_with_key_and_user_id(api_key, user_id)
        url = f"{self._api_url}/dataset-git"

        data = {
            "dataset_id": str(dataset_id),
            "dataset_type": "Tabular",
            "title": name,
            "tags": [
                "Dataset"
            ],
            "category": "AI",
            "details": description,
            "user_id": user_id
        }
        
        resp = requests.post(url, headers=headers, data=json.dumps(data))
        raise_bagel_error(resp)
        
        resp_text = resp.text
        uuid_clean = resp_text.strip('"')

        return uuid_clean

    @override
    def get_dataset_info(
            self,
            dataset_id: str,
            path: Optional[str] = "",
            api_key: Optional[str] = None
    ) -> str:
        """Get information about a dataset."""
        headers = self._popuate_headers_with_api_key(api_key)
        url = f"{self._api_url}/dataset-git"
        
        data = {'dataset_id': dataset_id, 'path': path}
        
        resp = requests.get(url, headers=headers, params=data)

        resp_json = resp.json()
        
        return resp_json
    
    @override
    def upload_dataset(
            self,
            dataset_id: str,
            chunk_number: int = 1,
            file_name: str = "",
            file_content: bytes = None,
            api_key: Optional[str] = None
    ) -> str:
        """Upload a dataset file to Bagel."""
        headers = self._popuate_headers_with_api_key(api_key)
        url = f"{self._api_url}/datasets/{dataset_id}/upload-dataset-git"

        params = {'dataset_id': dataset_id, 'chunk_number': chunk_number, 'file_name': file_name}

        files = {'data_file': (file_name, file_content)}
        
        resp = requests.post(url, headers=headers, files=files, params=params)
        
        return resp.text
    
    @override
    def download_dataset(
            self,
            dataset_id: str,
            file_path: Optional[str] = "",
            api_key: Optional[str] = None
    ) -> str:
        """Download a specific file from dataset."""
        headers = self._popuate_headers_with_api_key(api_key)
        url = f"{self._api_url}/download-dataset-git"
        
        params = {'dataset_id': dataset_id, 'file_path': file_path}
        
        resp = requests.get(url, headers=headers, params=params)
        # raise_bagel_error(resp)
        
        file_content = resp.content
        file_name = resp.headers.get('Content-Disposition', '').split('filename=')[1].strip('"')
        file_type = resp.headers.get('Content-Type', '')
        
        return file_content, file_name, file_type
    
    @override
    def download_dataset_files(
            self, 
            dataset_id: str, 
            target_dir: str,
            file_path: Optional[str] = "",
            api_key: Optional[str] = None
            ) -> bool:
        
        headers = self._popuate_headers_with_api_key(api_key)

        os.makedirs(target_dir, exist_ok=True)
        
        dataset_info = self.get_dataset_info(dataset_id, file_path)
        file_types = ["file", "dir"]

        dataset_id = dataset_info['dataset_id']
        repo_info = dataset_info['repo_info']
        files = repo_info['files']

        for file_info in files:
            file_path = file_info['path']
            if file_info['type'] == file_types[0]:
                file_content, file_name, file_type = self.download_dataset(
                    dataset_id=dataset_id,
                    file_path=file_path
                )

                file_path = os.path.join(target_dir, file_name)
                with open(file_path, "wb") as file:
                    file.write(file_content)

            elif file_info['type'] == file_types[1]:
                dataset_dir_info = self.get_dataset_info(dataset_id, file_path)
                self.download_dataset_files(dataset_dir_info, target_dir)
        
        return True


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
