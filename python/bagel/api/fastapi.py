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
                self.download_dataset_files(dataset_id, target_dir, file_path)
        
        return True
    
    @override
    def create_asset(self, payload: dict, api_key: Optional[str] = None) -> str:
        url = f"{self._api_url}/asset"
        # Define the payload for creating a dataset
        headers = self._popuate_headers_with_api_key(api_key)

        if not payload or not isinstance(payload, dict):
            raise ValueError("Payload must be a non-empty dictionary")
        
        required_fields = ['dataset_type', 'title', 'user_id']
        missing_fields = [field for field in required_fields if field not in payload]
        
        if missing_fields:
            raise ValueError(f"Missing required fields in payload: {', '.join(missing_fields)}")

        if payload['dataset_type'] not in ['RAW', 'MODEL', 'VECTOR']:
            raise ValueError("Invalid dataset_type. Must be 'RAW', 'MODEL', or 'VECTOR'")

        # Make a POST request to create a dataset
        response = requests.post(url, json=payload, headers=headers)

        # Check the response status code
        if response.status_code == 200:
            asset_id = response.json()
            return asset_id
        else:
            return (f"Error creating dataset: {response.json()}")
    
    @override
    def get_assets_list(self, user_id: str, api_key: Optional[str] = None) -> str:
        if not user_id:
            raise ValueError("User ID must be provided")
        
        headers = self._popuate_headers_with_api_key(api_key)

        try:
            url = f"{self._api_url}/datasets?owner=${user_id}"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                assets_list = response.json()
                return assets_list
            else:
                return ('Error retrieving data: ', response.json())
        except Exception as e:
            return ("Error", e.text)
            
    @override
    def get_asset_info(self, asset_id: str, api_key: Optional[str] = None) -> str:
        if not asset_id:
            raise ValueError("Asset ID must be provided")
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/asset/{asset_id}"
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                asset_info = response.json()
                return asset_info
            else:
                return "Error retrieving data"
        except Exception as e:
            return ("Error occured: ", e)
            
    # delete asset function
    @override
    def delete_asset(self, dataset_id: str, api_key: Optional[str] = None) -> str:
        if not dataset_id:
            raise ValueError("Dataset ID must be provided")
        url = f"{self._api_url}/asset/{dataset_id}"

        headers = self._popuate_headers_with_api_key(api_key)
        response = requests.delete(url, headers=headers)
        try:
            if response.status_code == 204:
                return (f"Dataset {dataset_id} deleted successfully!")
            else:
                return (f"Error deleting dataset: {response.text}")


        except Exception as e:
            return ("Error: ", e)

    @override
    def download_model_file(self, asset_id: str, file_name: str, api_key: Optional[str] = None) -> Document:
        if not asset_id or not file_name:
            raise ValueError("Both asset ID and file name must be provided")
        url = f"{self._api_url}/jobs/asset/{asset_id}/files/{file_name}"
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            response = requests.get(url, headers=headers, stream=True)
            if response.status_code == 200:
                with open(file_name, "wb") as f:
                    for chunks in response.iter_content(chunk_size=8192):
                        f.write(chunks)
                return (f"File successfully downloaded and saved as {file_name}")
            else:
                return ("Error downloading file")
        except Exception as e:
            return ("Error", e)

    @override
    def download_model(self, asset_id: str, api_key: Optional[str] = None) -> Any:
        if not asset_id:
            raise ValueError("Asset ID must be provided")
        """download model"""
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/jobs/asset/{asset_id}/download" 
            file_name = f'{asset_id}.zip'
            response = requests.get(url, headers=headers, stream=True)
            if response.status_code == 200:
                with open(file_name, "wb") as f:
                    for chunks in response.iter_content(chunk_size=8192):
                        f.write(chunks)
                return (f"Successfully donwloaded! Model ID: {asset_id}")
            else:
                return ("Error downloading file")
        except Exception as e:
            return ("Error: ", e)

    @override
    def add_text(self, asset_id: str, payload: dict, api_key: Optional[str] = None) -> dict:
        if not asset_id:
            raise ValueError("Asset ID must be provided")

        if not payload or not isinstance(payload, dict):
            raise ValueError("Payload must be a non-empty dictionary")

        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/asset/{asset_id}/add"
            request_payload = {
                        "metadatas": [
                            {"source": payload['source']}
                        ],
                        "documents": [
                            payload['documents']
                        ],
                        "ids": [
                            str(uuid.uuid4())
                        ]
                    }
            # Make a POST request to query the asset
            response = requests.post(url, headers=headers, data=json.dumps(request_payload))
            # Check the response status code
            if response.status_code == 201:
                response_data = response.json()
                return (response_data)
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))
    
    @override
    def add_image(self, asset_id: str, file_path: str, api_key: Optional[str] = None):
        if not asset_id or not file_path:
            raise ValueError("Both asset ID and file path must be provided")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/asset/{asset_id}/add_image_file"
            file_name = os.path.basename(file_path)

            with open(file_path, "rb") as file:
                files = {"image_file":(file_name, file.read())}
            # Make a POST request to query the asset
            response = requests.post(url, headers=headers, files=files)
            # Check the response status code
            if response.status_code == 200:
                return "Image embedding successful!"
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))


    @override
    def query_asset(self, asset_id: str, payload: dict, api_key: Optional[str] = None) -> str:
        if not asset_id or not payload:
            raise ValueError("Both asset ID and payload must be provided")

        if not payload or not isinstance(payload, dict):
            raise ValueError("Payload must be a non-empty dictionary")

        required_keys = ['n_results', 'include', 'query_texts', 'padding']
        missing_keys = [key for key in required_keys if key not in payload]

        if missing_keys:
            raise ValueError(f"Missing required keys in payload: {', '.join(missing_keys)}")
        
        if not isinstance(payload['query_texts'], list) or not payload['query_texts']:
            raise ValueError("'query_texts' must be a non-empty list")
        if not isinstance(payload['n_results'], int) or payload['n_results'] <= 0:
            raise ValueError("'n_results' must be a positive integer")
        
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            # Format the URL with the asset ID
            query_url = f"{self._api_url}/asset/{asset_id}/query"

            # Make a POST request to query the asset
            response = requests.post(query_url, headers=headers, data=json.dumps(payload))

            # Check the response status code
            if response.status_code == 200:
                response_data = response.json()
                return (response_data)
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))
            
    @override
    def update_asset(self, asset_id: str, payload: dict, api_key: Optional[str] = None) -> str:

        headers = self._popuate_headers_with_api_key(api_key)

        try:
            # Format the URL with the asset ID
            update_url = f"{self._api_url}/datasets/{asset_id}"

            # Make a PUT request to update the asset
            response = requests.put(update_url, headers=headers, data=json.dumps(payload))

            # Check the response status code
            if response.status_code == 200:
                response_data = response.json()
                return (response_data)
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))
    
    @override
    def fine_tune(self, title: str, user_id: str, asset_id: str, file_name: str, 
                  base_model: str, epochs: Optional[int] = 3, learning_rate: Optional[float] = 0.001, 
                  input_column: str = None, output_column: str = None,
                  api_key: Optional[str] = None) -> str:
        required_params = {
            'title': title, 'user_id': user_id, 'asset_id': asset_id,
            'file_name': file_name, 'base_model': base_model
        }
        missing_params = [param for param, value in required_params.items() if not value]
        
        if missing_params:
            raise ValueError(f"Missing required parameters: {', '.join(missing_params)}")
        url = f"{self._api_url}/asset"
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            payload = {
                    "dataset_type": "MODEL",
                    "title": title,
                    "category": "AI",
                    "details": "",
                    "tags": [],
                    "user_id": user_id,
                    "fine_tune_payload": {
                        "asset_id": asset_id,
                        "model_name": title,
                        "base_model": base_model,
                        "file_name": file_name,
                        "epochs": epochs,
                        "learning_rate": learning_rate,
                        "user_id": user_id,
                        "input_column": input_column,
                        "output_column": output_column
                    }
                }
            response = requests.post(url, json=payload, headers=headers)
            
            # Check the response status code
            if response.status_code == 200:
                return ("Fine-tune operation has been started! Model ID: ", response.json())
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))
        
    @override
    def get_dataset_column_names(self, asset_id: str, file_name: str, api_key: Optional[str] = None):
        if not asset_id:
            raise ValueError("Asset ID must be provided")
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/asset/{asset_id}/{file_name}/get_column_names"  # Replace with the actual base URL
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                error_detail = response.json()
                print('Error response:', error_detail)
                raise Exception(f"Error getting job: {response.status_code} {error_detail.get('detail')}")
            else:
                return response.json()
        except Exception as error:
            print('Internal error:', error)
            raise error

    @override
    def get_job(self, job_id, api_key) -> str:

        headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        try:
            url = f"{self._api_url}/jobs/{job_id}"  # Replace with the actual base URL
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                error_detail = response.json()
                print('Error response:', error_detail)
                raise Exception(f"Error getting job: {response.status_code} {error_detail.get('detail')}")
            else:
                print("Job gotten successfully", response.text)
                # return response.json()
        except Exception as error:
            print('Internal error:', error)
            raise error

    @override
    def get_job_by_asset_id(self, asset_id: str, api_key: Optional[str] = None) -> str:
        if not asset_id:
            raise ValueError("Asset ID must be provided")
        headers = self._popuate_headers_with_api_key(api_key)

        try:
            # Format the URL with the asset ID
            url = f"{self._api_url}/jobs/asset/{asset_id}"

            # Make a GET request to get job by asset
            response = requests.get(url, headers=headers)

            # Check the response status code
            if response.status_code == 200:
                return ('Job retrieved successfully! Job Info:', response.json())
            else:
                error_detail = response.json()  # Catch the error detail
                return ('Error response:', error_detail)
        except Exception as e:
            return ('Internal error:', str(e))
        
        
    @override
    def list_jobs(self, user_id: str, api_key: Optional[str] = None) -> str:
        headers = self._popuate_headers_with_api_key(api_key)

        url = f"{self._api_url}/jobs/created_by/{user_id}"

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return ('List jobs response:', response.json())
        else:
            error_detail = response.json()
            return ('Error response:', error_detail)

    @override
    def file_upload(self, file_path: str, asset_id: str, api_key: Optional[str] = None) -> str:
        if not file_path or not asset_id:
            raise ValueError("Both file path and asset ID must be provided")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        headers = self._popuate_headers_with_api_key(api_key)
        try:
            url = f"{self._api_url}/asset/{asset_id}/upload"
            file_name = os.path.basename(file_path)

            with open(file_path, "rb") as file:
                files = {"data_file":(file_name, file.read())}
            response = requests.post(url, files=files, headers=headers)

            if response.status_code == 200:
                return ("Data uploaded successfully! ", response.json())
            else:
                return (f"Error uploading data: {response.json()}")
        except Exception as e:
            return ("Error: ", e)
        
    @override
    def buy_asset(self, asset_id: str, user_id: str, api_key: Optional[str] = None) -> str:
        """buy asset"""
        if not asset_id or not user_id:
            raise ValueError("Both asset ID and user ID must be provided")
        headers = self._popuate_headers_with_api_key(api_key)

        try:
            url = f"{self._api_url}/asset/{asset_id}/buy/{user_id}"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return ("Buy asset successful: ", response.json())
            else:
                return response.json()
        except Exception as e:
            return ("Error: ", e)
    
    @override
    def get_download_url(self, asset_id: str, file_name: str, api_key: Optional[str] = None) -> dict:
        if not asset_id or not file_name:
            raise ValueError("Both asset ID and file name must be provided")
        url = f"{self._api_url}/asset/{asset_id}/files/{file_name}"
        # Define the payload for creating a dataset
        headers = self._popuate_headers_with_api_key(api_key)

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                return response.json()
            else:
                return response.json()
        except Exception as e:
            return ("Error: ", e)
        
    @override
    def get_model_files_list(self, asset_id: str, api_key: Optional[str] = None):
        if not asset_id:
            raise ValueError("Asset ID must be provided")
        url = f"{self._api_url}/jobs/asset/{asset_id}/files"
        # Define the payload for creating a dataset
        headers = self._popuate_headers_with_api_key(api_key)

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                return response.json()
            else:
                return response.json()
        except Exception as e:
            return ("Error: ", e)
    
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


#===========================================================
