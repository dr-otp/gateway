export interface Customer {
  id: string;
  code: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdById: string;
  updatedById?: string;
  deletedById?: string;
}
