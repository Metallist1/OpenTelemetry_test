/*app.js*/
const {  context, propagation, trace, SpanStatusCode } = require('@opentelemetry/api');
const express = require('express');

const tracer = trace.getTracer('rabbit-sender', '0.1.0');

const PORT = parseInt(process.env.PORT || '8083');
const app = express();
app.use(express.json());

var amqp = require('amqplib/callback_api');

// Use http://localhost:8083/test
app.get('/test', (req, res) => {
  amqp.connect('amqp://guest:guest@host.docker.internal', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'hello';
      var msg = 'Hello world';
  
      channel.assertQueue(queue, {
        durable: false
      });

      //Start cross service tracer
      let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
        const output = {};
        //Get context and inject into propogation
        propagation.inject(context.active(), output);
        const { traceparent, tracestate } = output;
    
        const objToSend = { key: 'value' };
    
        if (traceparent) {
          objToSend._meta = { traceparent, tracestate };
        }
        //Send message with rabbit mq
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(objToSend), 'utf-8'));
        console.log(" [x] Sent %s", msg);
        //Remember to close span. 
        span.end();
        return;
      });
    });

    setTimeout(function() {
      connection.close();
    }, 500);

  });
  
  res.send("Done");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
