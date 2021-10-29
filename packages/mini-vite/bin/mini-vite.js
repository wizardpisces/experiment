#!/usr/bin/env node

function start() {
    let createServer = require('../dist/index').default
    createServer()
}

start()