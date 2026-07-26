export type Client = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  ranch: string | null;
  active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string | null;
  active_ingredient: string | null;
  active_ingredient_id: string | null;
  ingredient: Pick<SimpleCatalog, "id" | "name" | "active"> | null;
  unit: string;
  default_dose: number;
  family_id: string | null;
  family: Pick<ProductFamily, "id" | "name" | "active"> | null;
  active: boolean;
  created_at: string;
};

export type SimpleCatalog = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  can_operate_drone: boolean;
  can_sell: boolean;
  active: boolean;
  created_at: string;
};

export type AppSettings = {
  id: boolean;
  drone_commission_rate: number;
  salesperson_commission_rate: number;
  default_price_per_hectare: number;
  updated_at: string;
};

export type ProductFamily = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type ApplicationProduct = {
  dose: number;
  product: Pick<Product, "id" | "name" | "unit"> | null;
};

export type Application = {
  id: string;
  service_date: string;
  hectares: number;
  price_per_hectare: number;
  total: number;
  crop: string;
  crop_id: string;
  crop_catalog: Pick<SimpleCatalog, "id" | "name" | "active"> | null;
  field_name: string | null;
  status: "programado" | "en_proceso" | "completado" | "cancelado";
  notes: string | null;
  drone_operator: Pick<AppUser, "id" | "name"> | null;
  salesperson: Pick<AppUser, "id" | "name"> | null;
  drone_commission_rate: number;
  salesperson_commission_rate: number;
  drone_commission: number;
  salesperson_commission: number;
  client: Pick<Client, "id" | "name" | "ranch"> | null;
  application_products: ApplicationProduct[];
};
