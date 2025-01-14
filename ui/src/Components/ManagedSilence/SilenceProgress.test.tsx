import { act } from "react-dom/test-utils";

import { mount } from "enzyme";

import toDiffableHtml from "diffable-html";

import { MockSilence } from "__fixtures__/Alerts";
import type { APISilenceT } from "Models/APITypes";
import { SilenceProgress } from "./SilenceProgress";

let silence: APISilenceT;

beforeEach(() => {
  silence = MockSilence();

  jest.restoreAllMocks();
  jest.useFakeTimers("modern");
});

afterEach(() => {
  jest.restoreAllMocks();
  // reset Date() to current time
  jest.useRealTimers();
});

const MountedSilenceProgress = () => {
  return mount(<SilenceProgress silence={silence} />);
};

describe("<SilenceProgress />", () => {
  it("renders with class 'danger' and no progressbar when expired", () => {
    jest.setSystemTime(new Date(Date.UTC(2001, 0, 1, 23, 0, 0)));
    const tree = MountedSilenceProgress();
    expect(toDiffableHtml(tree.html())).toMatch(/bg-danger/);
    expect(tree.text()).toMatch(/Expired 1 year ago/);
  });

  it("progressbar uses class 'danger' when > 90%", () => {
    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 55, 0)));
    const tree = MountedSilenceProgress();
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-danger/);
  });

  it("progressbar uses class 'danger' when > 75%", () => {
    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 50, 0)));
    const tree = MountedSilenceProgress();
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-warning/);
  });

  it("progressbar uses class 'success' when <= 75%", () => {
    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 30, 0)));
    const tree = MountedSilenceProgress();
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-success/);
  });

  it("progressbar is updated every 30 seconds", () => {
    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 30, 0)));
    const tree = MountedSilenceProgress();
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-success/);

    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 50, 0)));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-warning/);

    jest.setSystemTime(new Date(Date.UTC(2000, 0, 1, 0, 55, 0)));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(toDiffableHtml(tree.html())).toMatch(/progress-bar bg-danger/);
  });

  it("unmounts cleanly", () => {
    const tree = MountedSilenceProgress();
    tree.unmount();
  });
});
