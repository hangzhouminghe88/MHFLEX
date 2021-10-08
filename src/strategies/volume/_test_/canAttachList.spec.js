import strategy from '../strategy'

describe('strategies/volume/strategy', () => {
  test('canAttachList.uuidListIsUndefined', () => {
    let data = strategy.canAttachList();
    expect(data).toEqual(false)
  });

  test('canAttachList.uuidListIsEmptyArray', () => {
    let data = strategy.canAttachList([]);
    expect(data).toEqual(false)
  });

  test('canAttachList.noVolumeTable', () => {
    let data = strategy.canAttachList(['1']);
    expect(data).toEqual(false)
  })
});



// WEBPACK FOOTER //
// ./src/strategies/volume/__test__/canAttachList.spec.js
