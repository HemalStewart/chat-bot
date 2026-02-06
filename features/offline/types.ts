export type OfflinePack = {
  id: string;
  title: string;
  sizeMb: number;
  status: "available" | "downloading" | "ready" | "error";
};
