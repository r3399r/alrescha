import { ViewUser } from 'src/model/db/ViewUser';

export type GetUserIdResponse = ViewUser;

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
