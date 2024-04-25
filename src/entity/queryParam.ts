import { integer } from "aws-sdk/clients/cloudfront";

export interface IQueryParams {
    search?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }