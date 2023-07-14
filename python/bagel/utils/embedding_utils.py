from bagel.api.types import Documents, EmbeddingFunction, Embeddings
from pathlib import Path
import os
import tarfile
import requests
from typing import Any, Dict, List, cast
import numpy as np
import numpy.typing as npt
import importlib
from typing import Optional

try:
    from bagel.is_thin_client import is_thin_client
except ImportError:
    is_thin_client = False


class SentenceTransformerEmbeddingFunction(EmbeddingFunction):
    models: Dict[str, Any] = {}

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = "cpu"):
        if model_name not in self.models:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError:
                raise ValueError(
                    "The sentence_transformers python package is not installed. Please install it with `pip install sentence_transformers`"
                )
            self.models[model_name] = SentenceTransformer(model_name, device=device)
        self._model = self.models[model_name]

    def __call__(self, texts: Documents) -> Embeddings:
        return self._model.encode(list(texts), convert_to_numpy=True).tolist()  # type: ignore # noqa E501


class Text2VecEmbeddingFunction(EmbeddingFunction):
    def __init__(self, model_name: str = "shibing624/text2vec-base-chinese"):
        try:
            from text2vec import SentenceModel
        except ImportError:
            raise ValueError(
                "The text2vec python package is not installed. Please install it with `pip install text2vec`"
            )
        self._model = SentenceModel(model_name_or_path=model_name)

    def __call__(self, texts: Documents) -> Embeddings:
        return self._model.encode(list(texts), convert_to_numpy=True).tolist()  # type: ignore # noqa E501


class OpenAIEmbeddingFunction(EmbeddingFunction):
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "text-embedding-ada-002",
        organization_id: Optional[str] = None,
        api_base: Optional[str] = None,
        api_type: Optional[str] = None,
    ):
        try:
            import openai
        except ImportError:
            raise ValueError(
                "The openai python package is not installed. Please install it with `pip install openai`"
            )

        if api_key is not None:
            openai.api_key = api_key
        # If the api key is still not set, raise an error
        elif openai.api_key is None:
            raise ValueError(
                "Please provide an OpenAI API key. You can get one at https://platform.openai.com/account/api-keys"
            )

        if api_base is not None:
            openai.api_base = api_base

        if api_type is not None:
            openai.api_type = api_type

        if organization_id is not None:
            openai.organization = organization_id

        self._client = openai.Embedding
        self._model_name = model_name

    def __call__(self, texts: Documents) -> Embeddings:
        texts = [t.replace("\n", " ") for t in texts]
        embeddings = self._client.create(input=texts, engine=self._model_name)["data"]
        sorted_embeddings = sorted(embeddings, key=lambda e: e["index"]) 
        return [result["embedding"] for result in sorted_embeddings]


class CohereEmbeddingFunction(EmbeddingFunction):
    def __init__(self, api_key: str, model_name: str = "large"):
        try:
            import cohere
        except ImportError:
            raise ValueError(
                "The cohere python package is not installed. Please install it with `pip install cohere`"
            )

        self._client = cohere.Client(api_key)
        self._model_name = model_name

    def __call__(self, texts: Documents) -> Embeddings:
        return [
            embeddings
            for embeddings in self._client.embed(texts=texts, model=self._model_name)
        ]


class HuggingFaceEmbeddingFunction(EmbeddingFunction):
    def __init__(
        self, api_key: str, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        try:
            import requests
        except ImportError:
            raise ValueError(
                "The requests python package is not installed. Please install it with `pip install requests`"
            )
        self._api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_name}"
        self._session = requests.Session()
        self._session.headers.update({"Authorization": f"Bearer {api_key}"})

    def __call__(self, texts: Documents) -> Embeddings:
        return self._session.post(  # type: ignore
            self._api_url, json={"inputs": texts, "options": {"wait_for_model": True}}
        ).json()


class InstructorEmbeddingFunction(EmbeddingFunction):
    def __init__(
        self,
        model_name: str = "hkunlp/instructor-base",
        device: str = "cpu",
        instruction: Optional[str] = None,
    ):
        try:
            from InstructorEmbedding import INSTRUCTOR
        except ImportError:
            raise ValueError(
                "The InstructorEmbedding python package is not installed. Please install it with `pip install InstructorEmbedding`"
            )
        self._model = INSTRUCTOR(model_name, device=device)
        self._instruction = instruction

    def __call__(self, texts: Documents) -> Embeddings:
        if self._instruction is None:
            return self._model.encode(texts).tolist()

        texts_with_instructions = [[self._instruction, text] for text in texts]
        return self._model.encode(texts_with_instructions).tolist()


class ONNXMiniLM_L6_V2(EmbeddingFunction):
    MODEL_NAME = "all-MiniLM-L6-v2"
    DOWNLOAD_PATH = Path.home() / ".cache" / "bagel" / "onnx_models" / MODEL_NAME
    EXTRACTED_FOLDER_NAME = "onnx"
    ARCHIVE_FILENAME = "onnx.tar.gz"
    MODEL_DOWNLOAD_URL = (
        "https://bagel-essential.s3.eu-north-1.amazonaws.com/onnx.tar.gz"
    )
    tokenizer = None
    model = None

    def __init__(self) -> None:
        self.tqdm = importlib.import_module("tqdm").tqdm
        self.Tokenizer = importlib.import_module("tokenizers").Tokenizer
        self.ort = importlib.import_module("onnxruntime")

    def _download(self, url: str, fname: Path, chunk_size: int = 1024) -> None:
        resp = requests.get(url, stream=True)
        total = int(resp.headers.get("content-length", 0))
        with open(fname, "wb") as file, self.tqdm(
            desc=str(fname),
            total=total,
            unit="iB",
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in resp.iter_content(chunk_size=chunk_size):
                size = file.write(data)
                bar.update(size)

    def _normalize(self, v: npt.NDArray) -> npt.NDArray:
        norm = np.linalg.norm(v, axis=1)
        norm[norm == 0] = 1e-12
        return v / norm[:, np.newaxis]

    def _forward(self, documents: List[str], batch_size: int = 32) -> npt.NDArray:
        # We need to cast to the correct type because the type checker doesn't know that init_model_and_tokenizer will set the values
        self.tokenizer = cast(self.Tokenizer, self.tokenizer)  # type: ignore
        self.model = cast(self.ort.InferenceSession, self.model)  # type: ignore
        all_embeddings = []
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            encoded = [self.tokenizer.encode(d) for d in batch]
            input_ids = np.array([e.ids for e in encoded])
            attention_mask = np.array([e.attention_mask for e in encoded])
            onnx_input = {
                "input_ids": np.array(input_ids, dtype=np.int64),
                "attention_mask": np.array(attention_mask, dtype=np.int64),
                "token_type_ids": np.array(
                    [np.zeros(len(e), dtype=np.int64) for e in input_ids],
                    dtype=np.int64,
                ),
            }
            model_output = self.model.run(None, onnx_input)
            last_hidden_state = model_output[0]
            # Perform mean pooling with attention weighting
            input_mask_expanded = np.broadcast_to(
                np.expand_dims(attention_mask, -1), last_hidden_state.shape
            )
            embeddings = np.sum(last_hidden_state * input_mask_expanded, 1) / np.clip(
                input_mask_expanded.sum(1), a_min=1e-9, a_max=None
            )
            embeddings = self._normalize(embeddings).astype(np.float32)
            all_embeddings.append(embeddings)
        return np.concatenate(all_embeddings)

    def _init_model_and_tokenizer(self) -> None:
        if self.model is None and self.tokenizer is None:
            self.tokenizer = self.Tokenizer.from_file(
                str(self.DOWNLOAD_PATH / self.EXTRACTED_FOLDER_NAME / "tokenizer.json")
            )
            self.tokenizer.enable_truncation(max_length=256)
            self.tokenizer.enable_padding(pad_id=0, pad_token="[PAD]", length=256)
            self.model = self.ort.InferenceSession(
                str(self.DOWNLOAD_PATH / self.EXTRACTED_FOLDER_NAME / "model.onnx")
            )

    def __call__(self, texts: Documents) -> Embeddings:
        self._download_model_if_not_exists()
        self._init_model_and_tokenizer()
        res = cast(Embeddings, self._forward(texts).tolist())
        return res

    def _download_model_if_not_exists(self) -> None:
        if not os.path.exists(self.DOWNLOAD_PATH / self.ARCHIVE_FILENAME):
            os.makedirs(self.DOWNLOAD_PATH, exist_ok=True)
            self._download(
                self.MODEL_DOWNLOAD_URL, self.DOWNLOAD_PATH / self.ARCHIVE_FILENAME
            )
            with tarfile.open(
                self.DOWNLOAD_PATH / self.ARCHIVE_FILENAME, "r:gz"
            ) as tar:
                tar.extractall(self.DOWNLOAD_PATH)


def DefaultEmbeddingFunction() -> Optional[EmbeddingFunction]:
    if is_thin_client:
        return None
    else:
        return ONNXMiniLM_L6_V2()


class GooglePalmEmbeddingFunction(EmbeddingFunction):
    def __init__(self, api_key: str, model_name: str = "models/embedding-gecko-001"):
        if not api_key:
            raise ValueError("Please provide a PaLM API key.")

        if not model_name:
            raise ValueError("Please provide the model name.")

        try:
            import google.generativeai as palm
        except ImportError:
            raise ValueError(
                "The Google Generative AI python package is not installed. Please install it with `pip install google-generativeai`"
            )

        palm.configure(api_key=api_key)
        self._palm = palm
        self._model_name = model_name

    def __call__(self, texts: Documents) -> Embeddings:
        return [
            self._palm.generate_embeddings(model=self._model_name, text=text)[
                "embedding"
            ]
            for text in texts
        ]


class GoogleVertexEmbeddingFunction(EmbeddingFunction):
    def __init__(
        self,
        api_key: str,
        model_name: str = "textembedding-gecko-001",
        project_id: str = "cloud-large-language-models",
        region: str = "us-central1",
    ):
        self._api_url = f"https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{region}/endpoints/{model_name}:predict"
        self._session = requests.Session()
        self._session.headers.update({"Authorization": f"Bearer {api_key}"})

    def __call__(self, texts: Documents) -> Embeddings:
        response = self._session.post(
            self._api_url, json={"instances": [{"content": texts}]}
        ).json()

        if "predictions" in response:
            return response["predictions"]
        return {}
