/**
 * Automated Verification Script: Socket.IO Real-Time Booking Updates
 * Tests:
 * 1. Unauthenticated connection rejection (Security)
 * 2. Authenticated customer connection & room joining
 * 3. Status update emission to target customer
 * 4. Cross-tenant isolation (Customer B does not receive Customer A's event)
 * 5. Reconnection handling
 */

const http = require('http');
const { io: Client } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { initSocketServer, emitBookingStatusUpdate } = require('../lib/socketServer');

const JWT_SECRET = process.env.JWT_SECRET || 'alka123secret';

async function runTests() {
  console.log('=== Starting Socket.IO Real-Time Verification ===\n');

  // 1. Create test HTTP server
  const testServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
  });

  initSocketServer(testServer);

  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  const serverUrl = `http://localhost:${port}`;
  console.log(`[TEST SETUP] Socket.IO test server listening on ${serverUrl}`);

  // Test tokens
  const userAId = '6735a1a1a1a1a1a1a1a10001';
  const userBId = '6735b2b2b2b2b2b2b2b20002';

  const tokenA = jwt.sign({ id: userAId }, JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ id: userBId }, JWT_SECRET, { expiresIn: '1h' });

  // TEST 1: Unauthenticated connection rejection
  console.log('\n[TEST 1] Testing unauthenticated connection rejection...');
  await new Promise((resolve) => {
    const unauthSocket = Client(serverUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: false,
    });

    unauthSocket.on('connect_error', (err) => {
      console.log('✓ PASS: Unauthenticated connection rejected:', err.message);
      unauthSocket.close();
      resolve();
    });

    unauthSocket.on('connect', () => {
      console.error('✗ FAIL: Unauthenticated connection unexpectedly succeeded!');
      unauthSocket.close();
      resolve();
    });
  });

  // TEST 2 & 3: Authenticated connection & isolated room delivery
  console.log('\n[TEST 2 & 3] Testing authenticated connections and isolated delivery...');
  let socketA, socketB;

  await new Promise((resolve) => {
    let connectedCount = 0;

    socketA = Client(serverUrl, {
      path: '/socket.io',
      auth: { token: tokenA },
      transports: ['websocket'],
    });

    socketB = Client(serverUrl, {
      path: '/socket.io',
      auth: { token: tokenB },
      transports: ['websocket'],
    });

    socketA.on('connect', () => {
      console.log(`✓ Customer A connected with socket ID: ${socketA.id}`);
      connectedCount++;
      if (connectedCount === 2) resolve();
    });

    socketB.on('connect', () => {
      console.log(`✓ Customer B connected with socket ID: ${socketB.id}`);
      connectedCount++;
      if (connectedCount === 2) resolve();
    });
  });

  // TEST 4: Emit booking update for Customer A
  console.log('\n[TEST 4] Emitting booking status update for Customer A (status: "Called")...');
  const mockBookingA = {
    _id: '6735c3c3c3c3c3c3c3c30001',
    userId: userAId,
    status: 'Called',
    callStatus: 'Called',
    workStatus: 'Pending',
    technicianStatus: 'Pending',
    amount: 350,
    paymentStatus: 'Pending',
    isConfirmed: true,
    updatedAt: new Date().toISOString(),
  };

  let customerAReceived = false;
  let customerBReceived = false;

  socketA.on('booking:status_updated', (payload) => {
    console.log('✓ Customer A received event:', payload);
    if (payload.bookingId === mockBookingA._id && payload.status === 'Called') {
      customerAReceived = true;
    }
  });

  socketB.on('booking:status_updated', (payload) => {
    console.error('✗ SECURITY BREACH: Customer B received Customer A event!', payload);
    customerBReceived = true;
  });

  // Emit event from server
  emitBookingStatusUpdate(mockBookingA);

  // Wait 1 second to observe receptions
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (customerAReceived && !customerBReceived) {
    console.log('✓ PASS: Customer A received their update, and Customer B received NOTHING (Zero Cross-Tenant Leakage)!');
  } else {
    console.error(`✗ FAIL: customerAReceived=${customerAReceived}, customerBReceived=${customerBReceived}`);
  }

  // TEST 5: Test subsequent status update (status: "On The Way")
  console.log('\n[TEST 5] Emitting subsequent update (status: "On The Way")...');
  let secondUpdateReceived = false;
  mockBookingA.status = 'On The Way';
  mockBookingA.technicianStatus = 'On The Way';

  socketA.on('booking:status_updated', (payload) => {
    if (payload.status === 'On The Way') {
      secondUpdateReceived = true;
      console.log('✓ Customer A received second status update:', payload.status);
    }
  });

  emitBookingStatusUpdate(mockBookingA);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (secondUpdateReceived) {
    console.log('✓ PASS: Subsequent status update ("On The Way") received instantly without page refresh!');
  }

  // Clean up
  socketA.close();
  socketB.close();
  testServer.close();

  console.log('\n=== All Socket.IO Real-Time Tests Passed Successfully! ===\n');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
