// states:
// 0 - Running
// 1 - Suspended / Paused
// 2 - Cancelled / Failed
// 3 - Completed (not necessarily successfully)

export default {
  download: jest.fn(),
  pauseTask: jest.fn(),
  resumeTask: jest.fn(),
  stopTask: jest.fn(),
  TaskRunning: 0,
  TaskSuspended: 1,
  TaskCanceling: 2,
  TaskCompleted: 3,
  checkForExistingDownloads: jest.fn().mockImplementation(() => {
    return Promise.resolve([]);
  }),
  directories: {
    documents: '/downloads',
  },
};
