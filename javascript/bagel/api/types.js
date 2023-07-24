// bagel/errors.js - Assuming this file contains error classes or error handling functions
const errors = require('bagel/errors'); // Replace this with the actual path to your error handling file

class EmbeddingFunction {
  constructor() {
    // In JavaScript, we don't need to import or instantiate models explicitly
    // Implement the logic here to set up the model if necessary
  }

  async __call__(texts) {
    // Implement the logic here to perform the embedding
    // Return the embeddings in the same format as Python code
  }
}

function maybe_cast_one_to_many(target) {
  if (Array.isArray(target)) {
    // One Document or ID
    if (typeof target[0] === 'string' && target[0] !== null) {
      return [target[0]];
    }
    // One Embedding
    if (typeof target[0] === 'number') {
      return [target];
    }
  }
  // One Metadata dict
  if (typeof target === 'object') {
    return [target];
  }
  // Already a sequence
  return target;
}

function validate_ids(ids) {
  if (!Array.isArray(ids)) {
    throw new Error(`Expected IDs to be an array, got ${ids}`);
  }
  if (ids.length === 0) {
    throw new Error(`Expected IDs to be a non-empty array, got ${ids}`);
  }
  for (const id of ids) {
    if (typeof id !== 'string') {
      throw new Error(`Expected ID to be a string, got ${id}`);
    }
  }
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    const duplicates = [...ids.filter((id, index) => ids.indexOf(id) !== index)];
    throw new errors.DuplicateIDError(
      `Expected IDs to be unique, found duplicates for: ${duplicates}`
    );
  }
  return ids;
}

function validate_metadata(metadata) {
  if (typeof metadata !== 'object') {
    throw new Error(`Expected metadata to be an object, got ${metadata}`);
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof key !== 'string') {
      throw new Error(`Expected metadata key to be a string, got ${key}`);
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(
        `Expected metadata value to be a string, int, or float, got ${value}`
      );
    }
  }
  return metadata;
}

function validate_metadatas(metadatas) {
  if (!Array.isArray(metadatas)) {
    throw new Error(`Expected metadatas to be an array, got ${metadatas}`);
  }
  for (const metadata of metadatas) {
    validate_metadata(metadata);
  }
  return metadatas;
}

function validate_where(where) {
  if (typeof where !== 'object') {
    throw new Error(`Expected where to be an object, got ${where}`);
  }
  const keys = Object.keys(where);
  if (keys.length !== 1) {
    throw new Error(
      `Expected where to have exactly one operator, got ${JSON.stringify(where)}`
    );
  }
  const operator = keys[0];
  const value = where[operator];
  if (
    operator !== '$and' &&
    operator !== '$or' &&
    (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'object')
  ) {
    throw new Error(
      `Expected where value to be a string, int, float, or operator expression, got ${value}`
    );
  }
  if (operator === '$and' || operator === '$or') {
    if (!Array.isArray(value)) {
      throw new Error(
        `Expected where value for $and or $or to be an array of where expressions, got ${value}`
      );
    }
    if (value.length <= 1) {
      throw new Error(
        `Expected where value for $and or $or to be an array with at least two where expressions, got ${value}`
      );
    }
    for (const whereExpression of value) {
      validate_where(whereExpression);
    }
  }
  // Value is an operator expression
  if (typeof value === 'object') {
    // Ensure there is only one operator
    const valueKeys = Object.keys(value);
    if (valueKeys.length !== 1) {
      throw new Error(
        `Expected operator expression to have exactly one operator, got ${JSON.stringify(
          value
        )}`
      );
    }

    const operator = valueKeys[0];
    const operand = value[operator];

    // Only numbers can be compared with gt, gte, lt, lte
    if (
      operator === '$gt' ||
      operator === '$gte' ||
      operator === '$lt' ||
      operator === '$lte'
    ) {
      if (typeof operand !== 'number') {
        throw new Error(
          `Expected operand value to be a number for operator ${operator}, got ${operand}`
        );
      }
    }

    if (
      operator !== '$gt' &&
      operator !== '$gte' &&
      operator !== '$lt' &&
      operator !== '$lte' &&
      operator !== '$ne' &&
      operator !== '$eq'
    ) {
      throw new Error(
        `Expected where operator to be one of $gt, $gte, $lt, $lte, $ne, $eq, got ${operator}`
      );
    }

    if (typeof operand !== 'string' && typeof operand !== 'number') {
      throw new Error(
        `Expected where operand value to be a string, int, or float, got ${operand}`
      );
    }
  }
  return where;
}

function validate_where_document(where_document) {
  if (typeof where_document !== 'object') {
    throw new Error(`Expected where document to be an object, got ${where_document}`);
  }
  const keys = Object.keys(where_document);
  if (keys.length !== 1) {
    throw new Error(
      `Expected where document to have exactly one operator, got ${JSON.stringify(
        where_document
      )}`
    );
  }
  const operator = keys[0];
  const value = where_document[operator];
  if (operator !== '$contains' && operator !== '$and' && operator !== '$or') {
    throw new Error(
      `Expected where document operator to be one of $contains, $and, $or, got ${operator}`
    );
  }
  if (operator === '$and' || operator === '$or') {
    if (!Array.isArray(value)) {
      throw new Error(
        `Expected document value for $and or $or to be an array of where document expressions, got ${value}`
      );
    }
    if (value.length <= 1) {
      throw new Error(
        `Expected document value for $and or $or to be an array with at least two where document expressions, got ${value}`
      );
    }
    for (const whereDocumentExpression of value) {
      validate_where_document(whereDocumentExpression);
    }
  } else if (typeof value !== 'string') {
    throw new Error(
      `Expected where document operand value for operator $contains to be a string, got ${value}`
    );
  }
  return where_document;
}

function validate_include(include, allow_distances) {
  if (!Array.isArray(include)) {
    throw new Error(`Expected include to be an array, got ${include}`);
  }
  const allowedValues = ['documents', 'embeddings', 'metadatas'];
  if (allow_distances) {
    allowedValues.push('distances');
  }
  for (const item of include) {
    if (typeof item !== 'string') {
      throw new Error(`Expected include item to be a string, got ${item}`);
    }
    if (!allowedValues.includes(item)) {
      throw new Error(
        `Expected include item to be one of ${allowedValues.join(', ')}, got ${item}`
      );
    }
  }
  return include;
}

function validate_n_results(n_results) {
  if (typeof n_results !== 'number') {
    throw new Error(`Expected requested number of results to be a number, got ${n_results}`);
  }
  if (n_results <= 0) {
    throw new Error('Number of requested results cannot be negative or zero.');
  }
  return n_results;
}

function validate_embeddings(embeddings) {
  if (!Array.isArray(embeddings)) {
    throw new Error(`Expected embeddings to be an array, got ${embeddings}`);
  }
  if (embeddings.length === 0) {
    throw new Error('Expected embeddings to be a non-empty array');
  }
  for (const embedding of embeddings) {
    if (!Array.isArray(embedding) || !embedding.every(value => typeof value === 'number')) {
      throw new Error('Expected each embedding to be an array of numbers');
    }
  }
  return embeddings;
}

module.exports = {
  Metadata: Object,
  Where: Object,
  WhereDocument: Object,
  ID: String,
  IDs: Array,
  Vector: Array,
  Embedding: Array,
  Embeddings: Array,
  Metadatas: Array,

  LiteralValue: Object,
  LogicalOperator: Object,
  WhereOperator: Object,
  OperatorExpression: Object,
  WhereDocumentOperator: Object,

  GetResult: Object,
  QueryResult: Object,
  IndexMetadata: Object,

  EmbeddingFunction,
  maybe_cast_one_to_many,
  validate_ids,
  validate_metadata,
  validate_metadatas,
  validate_where,
  validate_where_document,
  validate_include,
  validate_n_results,
  validate_embeddings,
};
