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
  // Define the server and version for tracer clarity.
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'example-server',
    [ATTR_SERVICE_VERSION]: '0.1.1',
  }),
  traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
  // Below code will output to console, but this would be used to collect metrics with prometheus
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  // https://opentelemetry.io/docs/languages/js/libraries/#registration
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();