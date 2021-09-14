const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const _ = require('lodash');

const PROTO_PATH = __dirname + '/proto/employee.proto';

let {
    employees
} = require('./data.js');

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
console.log('packageDefinition', packageDefinition)
let employee_proto = grpc.loadPackageDefinition(packageDefinition).employee;
console.log('employee_proto', employee_proto)

function getDetails(call, callback) {
    callback(null, {
        message: _.find(employees, {
            id: call.request.id
        })
    });
}

function main() {
    let server = new grpc.Server();
    server.addService(employee_proto.Employee.service, {
        getDetails: getDetails
    });
    server.bind('0.0.0.0:4500', grpc.ServerCredentials.createInsecure());
    server.start();
}

main();