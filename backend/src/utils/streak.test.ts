import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDays,
  formatDateOnly,
  isDateOnlyString,
  parseDateOnly,
} from './dateOnly';
import {
  activeDatesFromLogs,
  buildDayStrip,
  computeAdherenceRate,
  computeCurrentStreak,
  computeLongestStreak,
  isActiveDay,
} from './streak';

describe('dateOnly', () => {
  it('validates and round-trips calendar dates', () => {
    assert.equal(isDateOnlyString('2026-07-20'), true);
    assert.equal(isDateOnlyString('2026-13-01'), false);
    assert.equal(isDateOnlyString('07-20-2026'), false);
    assert.equal(formatDateOnly(parseDateOnly('2026-07-20')), '2026-07-20');
    assert.equal(addDays('2026-07-20', -1), '2026-07-19');
  });
});

describe('streak', () => {
  it('treats workout or meals as an active day', () => {
    assert.equal(isActiveDay({ workoutDone: true, mealsFollowed: false }), true);
    assert.equal(isActiveDay({ workoutDone: false, mealsFollowed: true }), true);
    assert.equal(
      isActiveDay({ workoutDone: false, mealsFollowed: false }),
      false,
    );
  });

  it('counts consecutive days ending today', () => {
    const today = '2026-07-20';
    const active = ['2026-07-18', '2026-07-19', '2026-07-20'];
    assert.equal(computeCurrentStreak(active, today), 3);
  });

  it('allows streak to end at yesterday when today is inactive', () => {
    const today = '2026-07-20';
    const active = ['2026-07-18', '2026-07-19'];
    assert.equal(computeCurrentStreak(active, today), 2);
  });

  it('returns zero when today and yesterday are inactive', () => {
    assert.equal(
      computeCurrentStreak(['2026-07-15', '2026-07-16'], '2026-07-20'),
      0,
    );
  });

  it('breaks on gaps', () => {
    assert.equal(
      computeCurrentStreak(
        ['2026-07-17', '2026-07-19', '2026-07-20'],
        '2026-07-20',
      ),
      2,
    );
  });

  it('computes longest streak across history', () => {
    assert.equal(
      computeLongestStreak([
        '2026-07-01',
        '2026-07-02',
        '2026-07-03',
        '2026-07-10',
        '2026-07-11',
      ]),
      3,
    );
  });

  it('computes adherence rates and day strip', () => {
    const today = '2026-07-20';
    const active = activeDatesFromLogs([
      { date: '2026-07-20', workoutDone: true, mealsFollowed: false },
      { date: '2026-07-19', workoutDone: false, mealsFollowed: true },
      { date: '2026-07-17', workoutDone: true, mealsFollowed: true },
    ]);
    const rate7 = computeAdherenceRate(active, today, 7);
    assert.equal(rate7.activeDays, 3);
    assert.equal(rate7.windowDays, 7);
    assert.equal(rate7.rate, 3 / 7);

    const strip = buildDayStrip(today, 7, active);
    assert.equal(strip.length, 7);
    assert.equal(strip[6]?.date, today);
    assert.equal(strip[6]?.active, true);
    assert.equal(strip[5]?.active, true);
    assert.equal(strip[4]?.active, false);
  });
});
