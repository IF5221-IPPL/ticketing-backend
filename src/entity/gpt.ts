export interface IGptRequest {
  userId: string,
  messages:{ role: string; content: string }[];
}
