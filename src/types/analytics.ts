export interface MonthlyBusinessReport {
  period: string;
  total_revenue_ron: number;
  total_bookings: number;
  total_guests_adults: number;
  total_guests_children: number;
  total_room_nights: number;
  adr_ron: number;
  top_booked_rooms: Record<string, number>;
  ai_strategic_brief: string;
}

export interface BusinessComparison {
  current_period: string;
  previous_period: string;
  current_revenue_ron: number;
  previous_revenue_ron: number;
  revenue_growth_pct: number;
  current_bookings: number;
  previous_bookings: number;
  bookings_growth_pct: number;
  current_total_guests: number;
  previous_total_guests: number;
  guests_growth_pct: number;
  current_chat_inquiries: number;
  previous_chat_inquiries: number;
  chat_growth_pct: number;
  ai_growth_narrative: string;
}

export interface FunnelAttribution {
  period: string;
  chat_availability_inquiries: number;
  direct_bookings_created: number;
  conversion_rate_pct: number;
  estimated_chat_driven_revenue_ron: number;
  executive_assessment: string;
}

export interface PricingForecast {
  target_period: string;
  current_booked_revenue_ron: number;
  confirmed_bookings_count: number;
  ai_pricing_strategy: string;
}
