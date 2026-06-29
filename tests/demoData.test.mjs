import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SEED_ACTIVITIES,
    SEED_APTITUDE_ATTEMPTS,
    SEED_USERS,
} from '../src/lib/seedData.js';
import { computeStudentAptitudeAnalytics } from '../src/lib/aptitudeAnalytics.js';
import {
    buildNvidiaPayload,
    extractAssistantText,
} from '../api/ai-assistant.js';

const studentUsers = SEED_USERS.filter((user) => user.role === 'student');

test('demo students are all Computer Science students', () => {
    assert.equal(studentUsers.length, 10);
    assert.deepEqual(
        [...new Set(studentUsers.map((student) => student.department))],
        ['Computer Science']
    );
    assert.ok(
        studentUsers.every((student) => student.student_id.startsWith('CS-'))
    );
});

test('demo data has at least ten approved Computer Science activities across all demo students', () => {
    const studentIds = new Set(studentUsers.map((student) => student.id));
    const approvedActivities = SEED_ACTIVITIES.filter(
        (activity) => studentIds.has(activity.student_id) && activity.status === 'approved'
    );

    assert.ok(approvedActivities.length >= 10);
    assert.ok(
        approvedActivities.every(
            (activity) => activity.department === 'Computer Science'
        )
    );
    assert.deepEqual(
        new Set(approvedActivities.map((activity) => activity.student_id)),
        studentIds
    );
});

test('student aptitude analytics summarize the current student against cohort attempts', () => {
    const analytics = computeStudentAptitudeAnalytics({
        allAttempts: SEED_APTITUDE_ATTEMPTS,
        studentId: studentUsers[0].id,
    });

    assert.equal(analytics.totalAttempts, 1);
    assert.equal(analytics.passedAttempts, 1);
    assert.equal(analytics.bestScore, 92);
    assert.equal(analytics.averageScore, 92);
    assert.equal(analytics.passRate, 100);
    assert.equal(analytics.percentile, 100);
});

test('student aptitude analytics return empty-state values when no attempts exist', () => {
    const analytics = computeStudentAptitudeAnalytics({
        allAttempts: SEED_APTITUDE_ATTEMPTS,
        studentId: 'missing-student',
    });

    assert.equal(analytics.totalAttempts, 0);
    assert.equal(analytics.bestScore, null);
    assert.equal(analytics.averageScore, 0);
    assert.equal(analytics.passRate, 0);
    assert.equal(analytics.percentile, null);
});

test('NVIDIA assistant payload uses Llama with VSARP context and non-streaming JSON', () => {
    const payload = buildNvidiaPayload({
        message: 'Explain employability score',
        pathname: '/student/dashboard',
        history: [
            { role: 'ai', text: 'Earlier answer' },
            { role: 'user', text: 'Earlier question' },
        ],
    });

    assert.equal(payload.model, 'meta/llama-3.1-8b-instruct');
    assert.equal(payload.stream, false);
    assert.equal(payload.temperature, 0.2);
    assert.equal(payload.top_p, 0.7);
    assert.match(payload.messages[0].content, /VSARP/);
    assert.deepEqual(payload.messages.at(-1), {
        role: 'user',
        content: 'Explain employability score',
    });
});

test('NVIDIA assistant response extraction reads the first assistant message', () => {
    assert.equal(
        extractAssistantText({
            choices: [{ message: { content: 'Use approved activities first.' } }],
        }),
        'Use approved activities first.'
    );
});
