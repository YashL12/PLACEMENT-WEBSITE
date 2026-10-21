const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Safely normalizes MongoDB URI, encoding special characters (such as '@' or ':')
 * in user credentials so connection parsers do not fail.
 */
function normalizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return rawUri;

  const scheme = schemeMatch[1];
  const rest = schemeMatch[2];

  const pathStartIndex = rest.search(/[\/\?]/);
  const authority = pathStartIndex === -1 ? rest : rest.substring(0, pathStartIndex);
  const pathAndQuery = pathStartIndex === -1 ? '' : rest.substring(pathStartIndex);

  const lastAtIndex = authority.lastIndexOf('@');
  if (lastAtIndex === -1) return rawUri;

  const userInfo = authority.substring(0, lastAtIndex);
  const host = authority.substring(lastAtIndex + 1);

  const colonIndex = userInfo.indexOf(':');
  if (colonIndex === -1) return rawUri;

  const username = userInfo.substring(0, colonIndex);
  let password = userInfo.substring(colonIndex + 1);

  try {
    const decoded = decodeURIComponent(password);
    password = encodeURIComponent(decoded);
  } catch (e) {
    password = encodeURIComponent(password);
  }

  return `${scheme}${username}:${password}@${host}${pathAndQuery}`;
}

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
    const uri = normalizeMongoUri(rawUri);

    const options = {
      // Connect to placement_portal if db is not explicitly specified in the URI path
      dbName: 'placement_portal',
    };

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    // Log error message safely without printing database connection URI or credentials
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

