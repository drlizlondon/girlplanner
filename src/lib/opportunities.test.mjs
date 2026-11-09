import test from 'node:test';
import assert from 'node:assert/strict';
import { sortOpportunities, opportunityUpdates } from './opportunities.ts';

test('opportunities sort by earliest deadline, with undated opportunities last', () => {
  const items = [
    { id: 'undated' },
    { id: 'later', deadline_date: new Date('2026-11-30T12:00:00Z') },
    { id: 'soon', deadline_date: new Date('2026-11-10T12:00:00Z') },
    { id: 'past', deadline_date: new Date('2026-11-01T12:00:00Z') },
  ];
  assert.deepEqual(sortOpportunities(items).map(item => item.id), ['past', 'soon', 'later', 'undated']);
  assert.equal(items[0].id, 'undated');
});

test('deadline edits persist a timestamp and clearing persists null', () => {
  assert.deepEqual(opportunityUpdates({ deadline_date: new Date('2026-11-12T12:00:00Z') }), { deadline_date: '2026-11-12T12:00:00.000Z' });
  assert.deepEqual(opportunityUpdates({ deadline_date: undefined }), { deadline_date: null });
});

test('editing notes alone leaves the saved deadline unchanged', () => {
  assert.deepEqual(opportunityUpdates({ details: 'New notes' }), { details: 'New notes' });
});