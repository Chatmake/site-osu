export type VenueType =
  | "Театр"
  | "Музей"
  | "Цирк"
  | "Кинотеатр"
  | "Дворец культуры"
  | "Другое";

export type Venue = {
  id: string;
  name: string;
  type: VenueType;
  address: string;
};

export type Event = {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  participants: string;
  start_at: string;
  poster_url: string | null;
};

export type SeatCategory = { id: string; name: string; description: string };

export type EventPrice = {
  event_id: string;
  seat_category_id: string;
  price_cents: number;
};

export type EventInventory = {
  event_id: string;
  seat_category_id: string;
  total_qty: number;
  sold_qty: number;
};

export type CartLine = {
  event_id: string;
  seat_category_id: string;
  title: string;
  venue: string;
  when: string;
  category: string;
  unit_price_cents: number;
  qty: number;
};

export type OrderDraft = {
  delivery_required: boolean;
  customer: {
    full_name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    event_id: string;
    seat_category_id: string;
    qty: number;
  }>;
};
