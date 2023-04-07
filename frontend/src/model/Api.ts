import { User, ViewUser } from './User';

export type GetUserResponse = (ViewUser & {
  pictureUrl: string | null;
})[];

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

export type PutUserIdQuotaRequest = {
  addQuota: number;
  code: string;
};

export type PutUserIdQuotaResponse = User;
