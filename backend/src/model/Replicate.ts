export type ReplicateResponse = {
  id: string;
  version: string;
  input: {
    image: string;
  };
  logs: string;
  output: string;
  error: null;
  status: string;
  created_at: string;
  started_at: string;
  completed_at: string;
  webhook: string;
  webhook_events_filter: [string];
  urls: {
    cancel: string;
    get: string;
  };
  metrics: {
    predict_time: number;
  };
};
