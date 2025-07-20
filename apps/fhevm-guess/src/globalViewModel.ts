import { proxy, useSnapshot } from 'valtio';

type ViewState = {
  fhevmInitialized: boolean;
};

class GlobalViewModel {
  private state = proxy<ViewState>({
    fhevmInitialized: false,
  });

  $useSnapshot() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSnapshot(this.state);
  }

  setFhevmInitialized(value: boolean) {
    this.state.fhevmInitialized = value;
  }
}

export const globalViewModel = new GlobalViewModel();
