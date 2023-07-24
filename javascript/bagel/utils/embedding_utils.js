class OpenAIEmbeddingFunction {
    constructor(api_key = null, model_name = "text-embedding-ada-002", organization_id = null, api_base = null, api_type = null) {
        try {
            const openai = require('openai');
        } catch (error) {
            throw new Error("The openai node package is not installed. Please install it with `npm install openai`");
        }

        if (api_key !== null) {
            openai.api_key = api_key;
        } else if (openai.api_key === null) {
            throw new Error("Please provide an OpenAI API key. You can get one at https://platform.openai.com/account/api-keys");
        }

        if (api_base !== null) {
            openai.api_base = api_base;
        }

        if (api_type !== null) {
            openai.api_type = api_type;
        }

        if (organization_id !== null) {
            openai.organization = organization_id;
        }

        this._client = openai.Embedding;
        this._model_name = model_name;
    }

    async call(texts) {
        texts = texts.map(t => t.replace(/\n/g, " "));
        const embeddings = (await this._client.create({ input: texts, engine: this._model_name })).data;
        const sorted_embeddings = embeddings.sort((a, b) => a.index - b.index);
        return sorted_embeddings.map(result => result.embedding);
    }
}


module.exports = OpenAIEmbeddingFunction;