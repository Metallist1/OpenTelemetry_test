// const opentelemetry = require('@opentelemetry/sdk-node')
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

// const sdk = new opentelemetry.NodeSDK({
//   traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
//   instrumentations: [getNodeAutoInstrumentations()],
// })
// sdk.start()

/*instrumentation.js*/
const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');

const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'dice-server3',
    [ATTR_SERVICE_VERSION]: '0.1.3',
  }),
  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318' }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();