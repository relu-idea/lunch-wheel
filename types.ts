
export interface Restaurant {
  id: string;
  name: string;
  color: string;
}

export interface RouletteResult {
  restaurant: Restaurant;
  aiComment: string;
}
