const http = require('http');
const data = JSON.stringify({ email: 'admin@swifttrack.com', password: 'swifttrack123' });
const options = {
    hostname: '13.49.243.241',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Origin': 'http://13.49.243.241:5000',
    },
    timeout: 10000,
};

const req = http.request(options, (res) =>
{
    console.log('STATUS', res.statusCode);
    console.log('HEADERS', JSON.stringify(res.headers));
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () =>
    {
        console.log('BODY', body);
    });
});

req.on('error', (e) =>
{
    console.error('REQUEST ERROR', e.message);
});

req.write(data);
req.end();
