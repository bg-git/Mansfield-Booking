const clientPromise = require('../mongodb-client');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Content-Type': 'application/json'
};

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
  try {
    const client = await clientPromise;
    const database = client.db();
    const appointmentsCollection = database.collection('appointments');
    const customersCollection = database.collection('customers');
    const order = JSON.parse(event.body);
    const properties = order.properties;
    let dateTime = null;

    if (!properties || properties.type !== 'appointment') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 'status': 'Order is not for appointment' })
      };
    }

    if (order.status === 'succeeded') {
      dateTime = Date.parse(properties.pickupTime);

      const cusstomerExist = await customersCollection.findOne({ id: order.customer.id });
  
      let insertCustomerResult
  
      if(!cusstomerExist) {
        insertCustomerResult = await customersCollection.insertOne({
          ...order.customer,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
  
      const price = order.total / 100.0;
      const doc = {
        dateTime,
        qty: 1,
        orderId: order.id,
        orderNumber: order.id,
        customerId: cusstomerExist ? cusstomerExist._id : insertCustomerResult.insertedId,
        price: price.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await appointmentsCollection.insertOne(doc);  

    } else if (order.status === 'refunded') {
      const query = { orderId: order.id };
      const result = await appointmentsCollection.deleteOne(query);
    } else if (order.status === 'rescheduled') {
      const query = { orderId: order.id };
      dateTime = Date.parse(properties.pickupTime);
      await appointmentsCollection.updateOne(query, {
          $set: {
            dateTime,
            updatedAt: new Date()
          }
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'success' })
    };

  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
