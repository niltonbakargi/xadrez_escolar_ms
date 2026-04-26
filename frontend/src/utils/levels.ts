// Valores do backend (como armazenado no banco)
export type LevelKey = "peao" | "cavalo" | "bispo" | "torre" | "dama" | "rei";

// Exibição amigável
export const LEVEL_LABEL: Record<string, string> = {
  peao:   "Peão",
  cavalo: "Cavalo",
  bispo:  "Bispo",
  torre:  "Torre",
  dama:   "Dama",
  rei:    "Rei",
};

export const LEVEL_ICON: Record<string, string> = {
  peao:   "♟",
  cavalo: "♞",
  bispo:  "♝",
  torre:  "♜",
  dama:   "♛",
  rei:    "♚",
};

// Ordem progressiva
export const LEVEL_ORDER: LevelKey[] = ["peao", "cavalo", "bispo", "torre", "dama", "rei"];
