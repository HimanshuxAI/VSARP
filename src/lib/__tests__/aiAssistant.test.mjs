import test from 'node:test';
import assert from 'node:assert/strict';

import { requestAssistantReply } from '../aiAssistant.js';

test('requestAssistantReply posts to the local assistant route', async () => {
    const originalFetch = global.fetch;
    const originalWindow = global.window;

    const requests = [];
    global.window = { setTimeout, clearTimeout };
    global.fetch = async (url, options) => {
        requests.push({ url, options });
        return {
            ok: true,
            json: async () => ({ reply: 'Server answer' }),
        };
    };

    try {
        const reply = await requestAssistantReply({
            message: 'Explain employability score',
            pathname: '/student/dashboard',
            history: [{ role: 'ai', text: 'Earlier answer' }],
        });

        assert.equal(reply, 'Server answer');
        assert.equal(requests.length, 1);
        assert.equal(requests[0].url, '/api/ai-assistant');

        const body = JSON.parse(requests[0].options.body);
        assert.equal(body.message, 'Explain employability score');
        assert.equal(body.pathname, '/student/dashboard');
        assert.deepEqual(body.history, [{ role: 'ai', text: 'Earlier answer' }]);
    } finally {
        global.fetch = originalFetch;
        global.window = originalWindow;
    }
});
