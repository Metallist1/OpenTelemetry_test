/*app.js*/
const { context, propagation, trace } = require('@opentelemetry/api');
const express = require('express');

const PORT = parseInt(process.env.PORT || '8084');
const app = express();
app.use(express.json());

const { listenForMessages } = require('./rabbitMQhelper.js');
const tracer = trace.getTracer('rabbit_reciever', '0.1.0');

// consume messages from RabbitMQ
const consume = function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
      channel.consume("hello", async function (msg) {
          let msgBody = msg.content.toString();

          try {
            const json = JSON.parse(msgBody);
            //Get current active context 
            let activeContext = context.active();
            if (json._meta) {
              //Extract context from message
              activeContext = propagation.extract(context.active(), json._meta);
              delete json._meta;
            }
            //Set span to record events/attributes/path to parent tracer
            span = tracer.startSpan('receive', { kind: 1 }, activeContext);
            trace.setSpan(activeContext, span);

            console.log('Parsed JSON:', json);
          } catch (e) {
            console.error('Error parsing JSON:', e.message);
          } finally {
            // Do not forget to close span.
            span.end();
          }

        await channel.ack(msg);
      });

      // handle connection closed
      connection.on("close", (err) => {
          return reject(err);
      });

      // handle errors
      connection.on("error", (err) => {
          return reject(err);
      });
  });
}

listenForMessages(consume);


app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
