const officialMock = require('@gorhom/bottom-sheet/mock');

const OfficialBottomSheet = officialMock.default;

class BottomSheet extends OfficialBottomSheet {
  render() {
    const { index, children } = this.props;

    if (typeof index === 'number' && index < 0) {
      return null;
    }

    return children;
  }
}

module.exports = { ...officialMock, __esModule: true, default: BottomSheet };
