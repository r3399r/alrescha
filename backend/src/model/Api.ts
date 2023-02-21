export type PutTreasureRequest = {
  userId: string;
  stage: number;
  answer?: string;
};

export type GetTreasureResponse = {
  id: string;
  userId: string;
  displayName: string;
  stage: number;
  status: string;
  dateCreated: string | null;
  dateUpdated: string | null;
}[];
