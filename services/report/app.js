const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
      }
}

async function processMessage(message) {
    const deliveryData = JSON.parse(message.content)
    try {
        await updateReport(deliveryData.products)
        console.log(`✔ SUCCESS, REPORT UPDATED`)
        await printReport()
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    const queueInstance = await RabbitMQService.getInstance()
    await queueInstance.consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
} 

consume()
