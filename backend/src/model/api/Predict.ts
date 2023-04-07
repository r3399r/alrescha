import { ReplicateResponse } from 'src/model/Replicate';

export type PostPredictRequest = {
  images: string[];
  userId: string;
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
};

export type PostPredictProcessRequest = ReplicateResponse;
