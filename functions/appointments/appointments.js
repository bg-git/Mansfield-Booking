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
    const appointmentsCollection = database.collection('appointments');
    const customersCollection = database.collection('customers');
    const settingsCollection = database.collection('settings');
    
    const options = {
      // sort returned documents in ascending order by title (A->Z)
      sort: { createdAt: -1 }
    };

    const appointCursor = await appointmentsCollection.find({}, options);
    console.log('[count]', await appointCursor.count());

    const setting = await settingsCollection.findOne({ id: 'setting' });

    await appointCursor.forEach((val) => {
      appointments.push({ 
        ...val,
        dateTime: moment(val.dateTime).format('YYYY-MM-DD hh:mm A'),
        start_time: moment(val.dateTime).format('YYYY-MM-DD hh:mm A'),
        end_time: moment(val.dateTime).add(setting.duration, 'minutes').format('YYYY-MM-DD hh:mm A'),
        customer: {}
      });
    });

    for(let i = 0; i < appointments.length; i++) {
      const customer = await customersCollection.findOne({ _id: appointments[i].customerId });
      appointments[i].customer = customer;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(appointments)
    };
  } catch (error) {
    console.log('[error]', error);
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
