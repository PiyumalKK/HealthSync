const { ServiceBusClient } = require('@azure/service-bus');

let sbClient = null;
const senders = {};

function getClient() {
  if (!sbClient) {
    const connStr = process.env.SERVICEBUS_CONNECTION_STRING;
    if (!connStr) {
      console.warn('SERVICEBUS_CONNECTION_STRING not set — events will be logged only');
      return null;
    }
    sbClient = new ServiceBusClient(connStr);
  }
  return sbClient;
}

async function getSender(queueName) {
  if (!senders[queueName]) {
    const client = getClient();
    if (!client) return null;
    senders[queueName] = client.createSender(queueName);
  }
  return senders[queueName];
}

async function publishEvent(queue, eventType, data) {
  try {
    const sender = await getSender(queue);
    if (!sender) {
      console.log(`[EVENT-LOCAL] ${queue}/${eventType}:`, JSON.stringify(data).substring(0, 200));
      return;
    }
    await sender.sendMessages({
      body: { eventType, data, timestamp: new Date().toISOString() },
      subject: eventType,
      contentType: 'application/json',
    });
    console.log(`[EVENT] Published ${eventType} to ${queue}`);
  } catch (err) {
    console.error(`[EVENT-ERROR] Failed to publish ${eventType}:`, err.message);
  }
}

async function closeEventBus() {
  for (const sender of Object.values(senders)) {
    await sender.close().catch(() => {});
  }
  if (sbClient) await sbClient.close().catch(() => {});
}

module.exports = { publishEvent, closeEventBus };
