export type ViewUser = {
  id: string;
  name: string;
  quota: number;
  codeformerFidelity: number;
  backgroundEnhance: boolean;
  faceUpsample: boolean;
  upscale: number;
  avg: number | null;
  count: number | null;
  lastDateUpdated: string;
};
