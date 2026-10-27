import catalog from "../../assets/theme-catalog.json";
export type ThemeId = "animals" | "food" | "world" | "timeline" | "jobs";
export type ModeId = ThemeId | "custom";
export interface CardFace { name: string; image: string }
export interface CardPair { id: string; left: CardFace; right: CardFace }
export interface Theme { id: ThemeId; name: string; detail: string; description: string; kind: "same" | "related"; cover: string; accent: string; minPairs: number; pairs: CardPair[] }
export const themes = catalog as Theme[];
export const findTheme = (id: string) => themes.find((theme) => theme.id === id);
