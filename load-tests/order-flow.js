import http from 'k6/http';
import { check, sleep } from 'k6';

// configuration
export const options = {
    vus: 1, // Start with 1 user to avoid spamming too much initially
    duration: '10s',
};

export default function orderFlowTest() {
    const payload = JSON.stringify({
        ebookId: 'cmjim04jb0001fzrzrai32xn5', // Ensure this ID exists in your DB or mock it
        name: 'Load Test User',
        email: 'test@example.com',
        phone: '9999999999',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post('http://localhost:2222/api/orders/create', payload, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'transaction created': (r) => r.json('orderId') !== undefined,
    });

    sleep(1);
}
