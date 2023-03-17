export type PostPredictRequest = {
  images: string[];
  userId: string;
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
};

export type GetUserIdResponse = {
  quota: number;
  count: number;
};
