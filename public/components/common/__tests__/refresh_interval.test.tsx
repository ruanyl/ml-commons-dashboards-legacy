/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { RefreshInterval, RefreshIntervalProps } from '../refresh_interval';
import { Storage } from '../../../../../../src/plugins/opensearch_dashboards_utils/public';

async function setup({
  minInterval = 3000,
  onRefresh = jest.fn(),
  persistence,
}: Partial<RefreshIntervalProps>) {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  // Set minimum interval 3000ms(3s)
  render(
    <RefreshInterval onRefresh={onRefresh} minInterval={minInterval} persistence={persistence} />
  );
  // open popover
  await user.click(screen.getByLabelText(/set refresh interval/i));
  return { user };
}

describe('<RefreshInterval />', () => {
  const storage = new Storage(localStorage);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    storage.clear();
  });

  it('should render a paused RefreshInterval by default', async () => {
    await setup({ minInterval: 3000 });
    const currentIntervalInput = screen.getByLabelText(/current interval value/i);
    expect(currentIntervalInput).toHaveValue('Off');
    expect(screen.getByLabelText(/interval value input/)).toHaveValue(3);
    expect(screen.getByLabelText(/interval unit selector/)).toHaveValue('s');
  });

  it('should display a default interval setting popover', async () => {
    await setup({ minInterval: 3000 });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/interval value input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interval unit selector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start refresh interval/i)).toBeInTheDocument();
  });

  it('should not allow user to start the interval if the input value is invalid', async () => {
    // Set minimum interval 3000ms
    const { user } = await setup({ minInterval: 3000 });
    expect(screen.getByLabelText(/start refresh interval/i)).toBeEnabled();

    // User input an invalid value: 1s
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '1');
    // The `Start` should be disabled if input interval is invalid
    expect(screen.getByLabelText(/start refresh interval/i)).toBeDisabled();
  });

  it('should allow user to start the interval if the input value is valid', async () => {
    // Set minimum interval 3000ms
    const { user } = await setup({ minInterval: 3000 });

    // User input a valid value: 10s
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '10');
    // The `Start` should be enabled if input interval is valid
    expect(screen.getByLabelText(/start refresh interval/i)).toBeEnabled();
  });

  it('should display the current interval after starting the interval', async () => {
    const { user } = await setup({ minInterval: 3000 });
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('Off');
    await user.click(screen.getByLabelText(/start refresh interval/i));
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('3 seconds');

    // change interval value to "10"
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '10');
    await user.click(screen.getByLabelText(/start refresh interval/i));
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('10 seconds');

    // change interval unit to "minutes"
    await user.selectOptions(screen.getByLabelText(/interval unit selector/i), 'minutes');
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('10 minutes');
  });

  it('should display `Off` when stop the interval', async () => {
    const { user } = await setup({ minInterval: 3000 });

    await user.click(screen.getByLabelText(/start refresh interval/i));
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('3 seconds');

    // Stop interval
    await user.click(screen.getByLabelText(/stop refresh interval/i));
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('Off');
  });

  it('should call `onRefresh` callback by default with minInterval when interval started', async () => {
    const onRefresh = jest.fn();
    const { user } = await setup({ minInterval: 3000, onRefresh });
    expect(onRefresh).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText(/start refresh interval/i));
    jest.advanceTimersByTime(3000);
    expect(onRefresh).toHaveBeenCalled();
  });

  it('should call `onRefresh` callback with user set interval when interval started', async () => {
    const onRefresh = jest.fn();
    const { user } = await setup({ minInterval: 3000, onRefresh });
    expect(onRefresh).not.toHaveBeenCalled();

    // user set interval to 10s
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '10');

    await user.click(screen.getByLabelText(/start refresh interval/i));
    jest.advanceTimersByTime(10000);
    expect(onRefresh).toHaveBeenCalled();
  });

  it('should NOT call `onRefresh` callback when interval stopped', async () => {
    const onRefresh = jest.fn();
    const { user } = await setup({ minInterval: 3000, onRefresh });
    expect(onRefresh).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText(/start refresh interval/i));
    jest.advanceTimersByTime(3000);
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText(/stop refresh interval/i));
    jest.advanceTimersByTime(10000);
    // only called once, it should not be called after `stop refresh interval`
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should pause the current interval if user set an invalid interval value', async () => {
    const onRefresh = jest.fn();
    const { user } = await setup({ minInterval: 3000, onRefresh });
    expect(onRefresh).not.toHaveBeenCalled();

    // user start interval
    await user.click(screen.getByLabelText(/start refresh interval/i));
    jest.advanceTimersByTime(3000);
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // user set a invalid interval value on the fly
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '1');
    jest.advanceTimersByTime(3000);
    // only called once, it should not be called when invalid value is set
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // The start button is disabled
    expect(screen.getByLabelText(/start refresh interval/i)).toBeDisabled();
  });

  it('should read interval settings from localStorage if it was set', async () => {
    const KEY = 'local_storage_test_key';
    // Set value to local storage
    storage.set(KEY, { intervalValue: 10, intervalUnit: 'm', isPaused: false });
    await setup({ minInterval: 3000, persistence: KEY });

    // Interval values are loaded
    expect(screen.getByLabelText(/interval value input/)).toHaveValue(10);
    expect(screen.getByLabelText(/interval unit selector/)).toHaveValue('m');

    // Interval started with the loaded values
    expect(screen.getByLabelText(/stop refresh interval/)).toBeInTheDocument();
    expect(screen.getByLabelText(/current interval value/i)).toHaveValue('10 minutes');
  });

  it('should persist interval settings to localStorage', async () => {
    const KEY = 'local_storage_test_key';
    const { user } = await setup({ minInterval: 3000, persistence: KEY });

    // The initial interval should be the minInterval passed by props
    // The initial interval unit should be seconds: `s`
    expect(storage.get(KEY)).toEqual({ intervalValue: 3, intervalUnit: 's', isPaused: true });

    // user set interval to 10 minutes and start interval
    await user.clear(screen.getByLabelText(/interval value input/i));
    await user.type(screen.getByLabelText(/interval value input/i), '10');
    await user.selectOptions(screen.getByLabelText(/interval unit selector/i), 'minutes');
    await user.click(screen.getByLabelText(/start refresh interval/i));
    expect(storage.get(KEY)).toEqual({ intervalValue: 10, intervalUnit: 'm', isPaused: false });
  });
});
