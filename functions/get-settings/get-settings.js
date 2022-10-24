const moment = require('moment');

const clientPromise = require('../mongodb-client');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Content-Type': 'application/json'
};

const handler = async (event) => {
  try {
    const appointments = [];
    const client = await clientPromise;
    const database = client.db();
    const settingsCollection = database.collection('settings');

    const setting = await settingsCollection.findOne({ id: 'setting' });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(setting)
    };
  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
