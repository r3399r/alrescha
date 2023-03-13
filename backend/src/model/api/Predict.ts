import { ReplicateResponse } from 'src/model/Replicate';

export type PostPredictRequest = {
  image: string;
};

export type PostPredictProcessRequest = ReplicateResponse;
