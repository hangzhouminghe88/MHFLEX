import strategy from '../strategy'

describe('strategies/volume/strategy', () => {
  test('canDetach.hasVmInstanceUuid.vmStateIsNotPaused', () => {
    let data = strategy.canDetach({
      type: 'Data',
      vmInstanceUuid: '2'
    }, {
      '2': {
        state: 'Running'
      }
    });
    expect(data).toEqual(true)
  });

  test('canDetach.hasVmInstanceUuid.vmStateIsPaused', () => {
    let data = strategy.canDetach({
      type: 'Data',
      vmInstanceUuid: '2'
    }, {
      '2': {
        state: 'Paused'
      }
    });
    expect(data).toEqual(false)
  });

  test('canDetach.hasVmInstanceUuidList.vmStateAreRunningAndPaused', () => {
    let data = strategy.canDetach({
      type: 'Data',
      vmInstanceUuidList: ['2', '3']
    }, {
      '2': {
        state: 'Running'
      },
      '3': {
        state: 'Paused'
      }
    });
    expect(data).toEqual(true)
  });

  test('canDetach.hasVmInstanceUuidList.vmStateArePaused', () => {
    let data = strategy.canDetach({
      type: 'Data',
      vmInstanceUuidList: ['2', '3']
    }, {
      '2': {
        state: 'Paused'
      },
      '3': {
        state: 'Paused'
      }
    });
    expect(data).toEqual(false)
  });

  test('canDetach.noVolume', () => {
    let data = strategy.canDetach();
    expect(data).toEqual(false)
  })
});



// WEBPACK FOOTER //
// ./src/strategies/volume/__test__/canDetach.spec.js
