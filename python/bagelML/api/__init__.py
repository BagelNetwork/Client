from abc import ABC, abstractmethod
from typing import Sequence, Optional, Dict, Any, List
from uuid import UUID

import pandas as pd
from bagel.api.Cluster import Cluster
from bagel.api.types import (
    ClusterMetadata,
    Document,
    Documents,
    Embeddings,
    IDs,
    Include,
    Metadatas,
    Metadata,
    Where,
    QueryResult,
    GetResult,
    WhereDocument,
    OneOrMany,
)
from bagel.config import Component
from overrides import override

DEFAULT_TENANT = "default_tenant"
DEFAULT_DATABASE = "default_database"


class API(Component, ABC):
    @abstractmethod
    def ping(self) -> int:
        """Returns the current server time in nanoseconds to check if the server is alive

        Args:
            None

        Returns:
            int: The current server time in nanoseconds

        """
        pass

    @abstractmethod
    def get_all_clusters(self, user_id: str = DEFAULT_TENANT, api_key: Optional[str] = None) -> Sequence[Cluster]:
        """Returns all clusters in the database

        Args:
            None

        Returns:
            dict: A dictionary of clusters

        """
        pass

    @abstractmethod
    def join_waitlist(self, email: str) -> Dict[str, str]:
        """
        Add email to waitlist
        Args:
            None

        Returns:
            dict: A dictionary of resposne
        """
        pass

    @abstractmethod
    def create_cluster(
        self,
        name: str,
        metadata: Optional[ClusterMetadata] = None,
        get_or_create: bool = False,
        user_id: str = DEFAULT_TENANT,
        api_key: Optional[str] = None,
        embedding_model: Optional[str] = None
    ) -> Cluster:
        """Creates a new cluster in the database

        Args:
            name  The name of the cluster to create. The name must be unique.
            metadata: A dictionary of metadata to associate with the cluster. Defaults to None.
            embedding_function: A function that takes documents and returns an embedding. Defaults to None.
            get_or_create: If True, will return the cluster if it already exists,
                and update the metadata (if applicable). Defaults to False.

        Returns:
            dict: the created cluster

        """
        pass

    @abstractmethod
    def delete_cluster(
        self,
        name: str,
        user_id: str = DEFAULT_TENANT,
        api_key: Optional[str] = None
    ) -> None:
        """Deletes a cluster from the database

        Args:
            name: The name of the cluster to delete
        """

    @abstractmethod
    def get_or_create_cluster(
        self,
        name: str,
        metadata: Optional[ClusterMetadata] = None,
        user_id: str = DEFAULT_TENANT,
        api_key: Optional[str] = None,
        embedding_model: Optional[str] = None,
        dimension: Optional[int] = None
    ) -> Cluster:
        """Calls create_cluster with get_or_create=True.
           If the cluster exists, but with different metadata, the metadata will be replaced.

        Args:
            name: The name of the cluster to create. The name must be unique.
            metadata: A dictionary of metadata to associate with the cluster. Defaults to None.
            embedding_function: A function that takes documents and returns an embedding. Should be the same as the one used to create the cluster. Defaults to None.
        Returns:
            the created cluster

        """
        pass

    @abstractmethod
    def get_cluster(
        self,
        name: str,
        user_id: str = DEFAULT_TENANT,
        api_key: Optional[str] = None
    ) -> Cluster:
        """Gets a cluster from the database by either name or uuid

        Args:
            name: The name of the cluster to get. Defaults to None.
            embedding_function: A function that takes documents and returns an embedding. Should be the same as the one used to create the cluster. Defaults to None.

        Returns:
            dict: the requested cluster

        """
        pass

    def _modify(
        self,
        id: UUID,
        new_name: Optional[str] = None,
        new_metadata: Optional[ClusterMetadata] = None,
        user_id: str = DEFAULT_TENANT,
        api_key: Optional[str] = None
    ) -> None:
        """Modify a cluster in the database - can update the name and/or metadata

        Args:
            current_name: The name of the cluster to modify
            new_name: The new name of the cluster. Defaults to None.
            new_metadata: The new metadata to associate with the cluster. Defaults to None.
        """
        pass

    @abstractmethod
    def _add(
        self,
        ids: IDs,
        cluster_id: UUID,
        embeddings: Embeddings,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
        increment_index: bool = True,
        api_key: Optional[str] = None
    ) -> bool:
        """Add embeddings to the data store. This is the most general way to add embeddings to the database.
        ⚠️ It is recommended to use the more specific methods below when possible.

        Args:
            cluster_id: The cluster to add the embeddings to
            embedding: The sequence of embeddings to add
            metadata: The metadata to associate with the embeddings. Defaults to None.
            documents: The documents to associate with the embeddings. Defaults to None.
            ids: The ids to associate with the embeddings. Defaults to None.
        """
        pass

    @abstractmethod
    def _update(
        self,
        cluster_id: UUID,
        ids: IDs,
        embeddings: Optional[Embeddings] = None,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
        api_key: Optional[str] = None
    ) -> bool:
        """Add embeddings to the data store. This is the most general way to add embeddings to the database.
        ⚠️ It is recommended to use the more specific methods below when possible.

        Args:
            cluster_id: The cluster to add the embeddings to
            embedding: The sequence of embeddings to add
        """
        pass

    @abstractmethod
    def _upsert(
        self,
        cluster_id: UUID,
        ids: IDs,
        embeddings: Embeddings,
        metadatas: Optional[Metadatas] = None,
        documents: Optional[Documents] = None,
        increment_index: bool = True,
        api_key: Optional[str] = None
    ) -> bool:
        """Add or update entries in the embedding store.
        If an entry with the same id already exists, it will be updated, otherwise it will be added.

        Args:
            cluster_id: The cluster to add the embeddings to
            ids: The ids to associate with the embeddings. Defaults to None.
            embeddings: The sequence of embeddings to add
            metadatas: The metadata to associate with the embeddings. Defaults to None.
            documents: The documents to associate with the embeddings. Defaults to None.
            increment_index: If True, will incrementally add to the ANN index of the cluster. Defaults to True.
        """
        pass

    @abstractmethod
    def _count(self, cluster_id: UUID,
               api_key: Optional[str] = None) -> int:
        """Returns the number of embeddings in the database

        Args:
            cluster_id: The cluster to count the embeddings in.


        Returns:
            int: The number of embeddings in the cluster

        """
        pass

    @abstractmethod
    def _peek(self, cluster_id: UUID, n: int = 10, api_key: Optional[str] = None) -> GetResult:
        pass

    @abstractmethod
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
        include: Include = ["embeddings", "metadatas", "documents"],
        api_key: Optional[str] = None
    ) -> GetResult:
        """Gets embeddings from the database. Supports filtering, sorting, and pagination.
        ⚠️ This method should not be used directly.

        Args:
            where: A dictionary of key-value pairs to filter the embeddings by. Defaults to {}.
            sort: The column to sort the embeddings by. Defaults to None.
            limit: The maximum number of embeddings to return. Defaults to None.
            offset: The number of embeddings to skip before returning. Defaults to None.
            page: The page number to return. Defaults to None.
            page_size: The number of embeddings to return per page. Defaults to None.

        Returns:
            pd.DataFrame: A pandas dataframe containing the embeddings and metadata

        """
        pass

    @abstractmethod
    def _delete(
        self,
        cluster_id: UUID,
        ids: Optional[IDs],
        where: Optional[Where] = {},
        where_document: Optional[WhereDocument] = {},
        api_key: Optional[str] = None
    ) -> IDs:
        """Deletes embeddings from the database
        ⚠️ This method should not be used directly.

        Args:
            where: A dictionary of key-value pairs to filter the embeddings by. Defaults to {}.

        Returns:
            List: The list of internal UUIDs of the deleted embeddings
        """
        pass

    @abstractmethod
    def _query(
        self,
        cluster_id: UUID,
        query_embeddings: Embeddings,
        n_results: int = 10,
        where: Where = {},
        where_document: WhereDocument = {},
        include: Include = ["embeddings", "metadatas", "documents", "distances"],
        query_texts: Optional[OneOrMany[Document]] = None,
        api_key: Optional[str] = None
    ) -> QueryResult:
        """Gets the nearest neighbors of a single embedding
        ⚠️ This method should not be used directly.

        Args:
            embedding: The embedding to find the nearest neighbors of
            n_results: The number of nearest neighbors to return. Defaults to 10.
            where: A dictionary of key-value pairs to filter the embeddings by. Defaults to {}.
        """
        pass

    @override
    @abstractmethod
    def reset(self) -> None:
        """Resets the database
        ⚠️ This is destructive and will delete all data in the database.
        Args:
            None

        Returns:
            None
        """
        pass

    # @abstractmethod
    # def raw_sql(self, sql: str) -> pd.DataFrame:
    #     """Runs a raw SQL query against the database
    #     ⚠️ This method should not be used directly.

    #     Args:
    #         sql: The SQL query to run

    #     Returns:
    #         pd.DataFrame: A pandas dataframe containing the results of the query
    #     """
    #     pass

    @abstractmethod
    def create_index(self, cluster_name: str) -> bool:
        """Creates an index for the given cluster
        ⚠️ This method should not be used directly.

        Args:
            cluster_name: The cluster to create the index for. Uses the client's cluster if None. Defaults to None.

        Returns:
            bool: True if the index was created successfully

        """
        pass

    @abstractmethod
    def persist(self) -> bool:
        """Persist the database to disk"""
        pass

    @abstractmethod
    def get_version(self) -> str:
        """Get the version of Bagel.

        Returns:
            str: The version of Bagel

        """
        pass

    @abstractmethod
    def _add_image(
        self, cluster_id: UUID, filename: str, metadata: Optional[Metadata]
    ) -> Any:
        """Add image to Bagel."""
        pass

    @abstractmethod
    def _add_image_urls(
        self,
        cluster_id: UUID,
        ids: IDs,
        urls: List[str],
        metadatas: Optional[Metadatas] = None,
        increment_index: bool = True,
    ) -> Any:
        """
        Add images by URLs to Bagel.
        If metadatas is not provided, it will be generated with default values.

        Args:
            cluster_id (UUID): The unique identifier of the cluster.
            ids (IDs): Identifier(s) associated with the image(s).
            urls (List[str]): List of URLs for the images to be added.
            metadatas (Optional[Metadatas]): Optional metadata for the image(s).
            increment_index (bool): Flag indicating whether to increment the cluster index.

        Returns:
            Any: Result of the image addition operation.

        Raises:
            HTTPException: If there is an error in the HTTP request.

        """
        pass

    def share_cluster(self, cluster_id: str, usernames: List[str]):
        pass
    
    @abstractmethod
    def create_dataset(
            self,
            dataset_id: UUID,
            name: str,
            description: str,
            user_id: str = DEFAULT_TENANT,
            api_key: Optional[str] = None
    ) -> str:
        """Create a dataset"""
        pass
    
    @abstractmethod
    def get_dataset_info(
            self, 
            dataset_id: str,
            api_key: Optional[str] = None
    ) -> str:
        """Get information about a dataset."""
        pass

    @abstractmethod
    def upload_dataset(
            self,
            dataset_id: str, 
            chunk_number: int = 1,
            file_name: str = "",
            file_content: bytes = None,
            api_key: Optional[str] = None
    ) -> str:
        """Upload a dataset file to Bagel."""
        pass

    @abstractmethod
    def download_dataset(
            self,
            dataset_id: str,
            file_path: Optional[str] = "",
            api_key: Optional[str] = None
    ) -> str:  
        """Download the full dataset."""
        pass
    
    @abstractmethod
    def download_dataset_files(
            self,
            dataset_id: str, 
            target_dir: str,
            file_path: Optional[str] = "",
            api_key: Optional[str] = None
            ) -> bool:
        pass

    # @abstractmethod
    # def fine_tune(self, payload: str, api_key: str) -> str:
    #     """Fine tune the model"""
    #     pass
    @abstractmethod
    def create_asset(self, payload: str, api_key: str) -> str:
        """create asset"""
        pass
    
    @abstractmethod
    def delete_asset(self, dataset_id, api_key) -> str:
        """delete asset"""
        pass
    
    @abstractmethod
    def download_file(self, asset_id, file_name, api_key) -> Document:
        """Download document"""
        pass