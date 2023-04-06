export type PostPredictRequest = {
  images: string[];
  userId: string;
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
};

export type GetUserIdResponse = {
  id: string;
  name: string;
  quota: number;
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
  avg: number | null;
  count: number | null;
};

export type GetUserIdPredictResponse = {
  id: string;
  before: string | null;
  after: string | null;
  dateCreated: string | null;
  dateUpdated: string | null;
}[];

export type PutUserIdRequest = {
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
};
