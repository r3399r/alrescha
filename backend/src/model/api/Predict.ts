import { ReplicateResponse } from 'src/model/Replicate';

export type PostPredictRequest = {
  images: string[];
};

export type PostPredictProcessRequest = ReplicateResponse;
