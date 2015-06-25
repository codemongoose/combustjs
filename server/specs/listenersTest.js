var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('listeners', function() {
  var socket;
  var agent;
  before(function(done) {
    configTest.resetDb(function() {
      configTest.authenticateSocket(function(newSocket, newAgent) {
        socket = newSocket;
        agent = newAgent;
        done();
      });
    });
  });

  after(function(done) {
    configTest.resetDb(function() {
      done();
    });
  });

  it('should notify listeners of parent urls of value changes', function(done) {
    socket.once('/-value', function(data) {
      if(data) {
        done();
      }
    });
    socket.emit('set', {path:'/users/', data: {testProperty: true, testSomething:{testProp: 'hallo'}}})
  }); 

  it('should receive updates when a child is added to a url', function(done) {
    socket.once('/messages/-childaddSuccess', function(data) {
      data.should.eql(utils.testObj);
      done();
    });
    socket.on('/messages/-subscribeUrlChildAddSuccess', function(response) {
      socket.emit('push', {path:'/messages/', data: utils.dummyObj});
    });
    socket.emit('subscribeUrlChildAdd', {url: '/messages/'});
  });
});
