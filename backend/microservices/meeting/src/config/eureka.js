const { Eureka } = require('eureka-js-client');

const APP_NAME = 'MEETING';
const HOST = process.env.HOST || 'localhost';
const IP_ADDRESS = process.env.IP_ADDRESS || '127.0.0.1';
const INSTANCE_NAME = process.env.INSTANCE_NAME || 'Amine';
const EUREKA_HOST = process.env.EUREKA_HOST || 'localhost';
const EUREKA_PORT = Number(process.env.EUREKA_PORT || 8761);

let client = null;

const createEurekaClient = (port) => {
  const baseUrl = `http://${HOST}:${port}`;
  return new Eureka({
    instance: {
      app: APP_NAME,
      instanceId: `${INSTANCE_NAME}:meeting:${port}`,
      hostName: HOST,
      ipAddr: IP_ADDRESS,
      port: { $: Number(port), '@enabled': true },
      vipAddress: 'meeting',
      homePageUrl: `${baseUrl}/`,
      statusPageUrl: `${baseUrl}/health`,
      healthCheckUrl: `${baseUrl}/health`,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: EUREKA_HOST,
      port: EUREKA_PORT,
      servicePath: '/eureka/apps/',
      registerWithEureka: true,
      fetchRegistry: true,
      maxRetries: 10,
      requestRetryDelay: 2000,
    },
  });
};

const startEureka = (port) => {
  client = createEurekaClient(port);
  client.start((error) => {
    if (error) {
      console.error('Eureka registration failed:', error.message || error);
    } else {
      console.log(`${APP_NAME} registered in Eureka (http://${EUREKA_HOST}:${EUREKA_PORT})`);
    }
  });
  return client;
};

const stopEureka = () => new Promise((resolve) => {
  if (!client) return resolve();
  client.stop(() => {
    console.log(`${APP_NAME} deregistered from Eureka`);
    client = null;
    resolve();
  });
});

const getServiceUrl = (appId) => {
  const instances = client ? client.getInstancesByAppId(appId).filter((instance) => instance.status === 'UP') : [];
  if (instances.length === 0) {
    const error = new Error(`No available instance of ${appId} in Eureka`);
    error.status = 503;
    throw error;
  }
  const instance = instances[Math.floor(Math.random() * instances.length)];
  return `http://${instance.hostName}:${instance.port.$}`;
};

module.exports = { startEureka, stopEureka, getServiceUrl };
