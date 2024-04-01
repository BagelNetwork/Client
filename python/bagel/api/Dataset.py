from typing import List, Optional


class Dataset:
    def __init__(self, client, dataset_id: str, title: str, details: str,
                 category: str, dataset_type: str = '', record_count: int = 0,
                 download_count: int = 0, owner_user_id: str = '',
                 created_at: str = '', ipfs_hash: str = '', job_status: str = '',
                 tags: Optional[List[str]] = None):
        self.client = client
        self.dataset_id = dataset_id
        self.title = title
        self.details = details
        self.category = category
        self.dataset_type = dataset_type
        self.record_count = record_count
        self.download_count = download_count
        self.owner_user_id = owner_user_id
        self.created_at = created_at
        self.ipfs_hash = ipfs_hash
        self.job_status = job_status
        self.tags = tags if tags is not None else []

    # Assuming Config is meant for a Pydantic model, but including a basic version for consistency
    class Config:
        arbitrary_types_allowed = True

    def delete(self):
        print("Deleting Dataset")
        self.client.delete_dataset(self.dataset_id)

    def publish_to_marketplace(self):
        print("Publishing Dataset")
        self.client.publish_dataset(self.dataset_id)
