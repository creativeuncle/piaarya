// Global Mongoose plugin: any schema that has a `store` path automatically
// gets scoped to the current request's store (read from tenantContext's
// AsyncLocalStorage), without controllers needing to filter by store
// themselves. Schemas without a `store` path (Store itself, and any future
// platform-level models) are left untouched.
const mongoose = require('mongoose');
const { getCurrentStoreId } = require('./tenantContext');

const SCOPED_QUERY_OPS = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndRemove',
  'countDocuments',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'distinct',
];

function tenantScopePlugin(schema) {
  if (!schema.path('store')) return;

  schema.pre(SCOPED_QUERY_OPS, function (next) {
    const storeId = getCurrentStoreId();
    if (storeId && !this.getQuery().store) {
      this.where({ store: storeId });
    }
    next();
  });

  schema.pre('save', function (next) {
    if (!this.store) {
      const storeId = getCurrentStoreId();
      if (storeId) this.store = storeId;
    }
    next();
  });

  schema.pre('insertMany', function (next, docs) {
    const storeId = getCurrentStoreId();
    if (storeId && Array.isArray(docs)) {
      docs.forEach((doc) => {
        if (!doc.store) doc.store = storeId;
      });
    }
    next();
  });

  // aggregate() doesn't go through query middleware, so it's handled
  // separately by overriding the static — this also covers any future
  // aggregate() calls automatically, without touching controllers.
  schema.statics.aggregate = function (pipeline = [], ...rest) {
    const storeId = getCurrentStoreId();
    const scopedPipeline = storeId
      ? [{ $match: { store: new mongoose.Types.ObjectId(storeId) } }, ...pipeline]
      : pipeline;
    return mongoose.Model.aggregate.call(this, scopedPipeline, ...rest);
  };
}

module.exports = tenantScopePlugin;
