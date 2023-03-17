export type GetUserIdResponse = {
  quota: number;
  count: number;
};

export type GetUserIdPredictResponse = {
  id: string;
  before: string | null;
  after: string | null;
  dateCreated: string | null;
  dateUpdated: string | null;
}[];
