// Import the dependency.
const { MongoClient } = require('mongodb');
// Export a module-scoped MongoClient promise. By doing this in a separate
// module, the client can be shared across functions.
const client = new MongoClient(process.env.REACT_APP_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('[MongoDB connected]');

module.exports = client.connect();
