import fs from "fs";
import path from "path";
import crypto from "crypto";
import { type MatchResult } from "./data/worldcup2026";
import { type KnockoutMatch } from "./data/knockout2026";
import { INITIAL_BRACKET } from "./data/knockout2026";

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON<T>(file: string, fallback: T): T {
  ensureDir();
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return fallback;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function saveJSON(file: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// Users
interface User {
  id: string;
  anonymousKey: string;
  nickname: string;
  myTeam: string | null;
  createdAt: string;
}

function loadUsers(): User[] { return loadJSON("users.json", []); }
function saveUsers(users: User[]) { saveJSON("users.json", users); }

export function findUserByAnonymousKey(key: string): User | undefined {
  return loadUsers().find(u => u.anonymousKey === key);
}

export function findUserById(id: string): User | undefined {
  return loadUsers().find(u => u.id === id);
}

export function createUser(anonymousKey: string): User {
  const users = loadUsers();
  const user: User = {
    id: crypto.randomUUID(),
    anonymousKey,
    nickname: `축구팬${Math.floor(Math.random() * 9000 + 1000)}`,
    myTeam: null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function setUserTeam(id: string, teamCode: string): User | undefined {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  if (!user) return undefined;
  user.myTeam = teamCode;
  saveUsers(users);
  return user;
}

export function deleteUser(id: string) {
  const users = loadUsers().filter(u => u.id !== id);
  saveUsers(users);
}

// Matches
export function loadMatches(): MatchResult[] {
  return loadJSON("matches.json", []);
}

export function saveMatches(matches: MatchResult[]) {
  saveJSON("matches.json", matches);
}

// Cached probability (팀별로 캐시)
interface CachedProbability {
  probability: number;
  groupPosition: number;
  thirdPlaceRank: number | null;
  calculatedAt: string;
}

function loadProbabilityCacheMap(): Record<string, CachedProbability> {
  return loadJSON("probability_cache.json", {});
}

export function loadCachedProbability(teamCode: string): CachedProbability | null {
  const map = loadProbabilityCacheMap();
  return map[teamCode] || null;
}

export function saveCachedProbability(teamCode: string, p: CachedProbability) {
  const map = loadProbabilityCacheMap();
  map[teamCode] = p;
  saveJSON("probability_cache.json", map);
}

// Knockout bracket
export function loadBracket(): KnockoutMatch[] {
  return loadJSON("bracket.json", INITIAL_BRACKET);
}

export function saveBracket(bracket: KnockoutMatch[]) {
  saveJSON("bracket.json", bracket);
}

// Tournament odds cache
interface CachedTournamentOdds {
  odds: Array<{ teamCode: string; winPct: number; finalPct: number; semiFinalPct: number; quarterFinalPct: number; roundOf16Pct: number }>;
  calculatedAt: string;
}

export function loadCachedTournamentOdds(): CachedTournamentOdds | null {
  return loadJSON("tournament_odds_cache.json", null);
}

export function saveCachedTournamentOdds(data: CachedTournamentOdds) {
  saveJSON("tournament_odds_cache.json", data);
}

// User predictions
export interface UserPrediction {
  userId: string;
  predictions: Record<string, string>; // matchId -> teamCode (predicted winner)
  updatedAt: string;
}

function loadPredictions(): UserPrediction[] { return loadJSON("predictions.json", []); }
function savePredictions(preds: UserPrediction[]) { saveJSON("predictions.json", preds); }

export function getAllPredictions(): UserPrediction[] { return loadPredictions(); }

export function getUserPrediction(userId: string): Record<string, string> {
  const pred = loadPredictions().find(p => p.userId === userId);
  return pred?.predictions ?? {};
}

export function saveUserPrediction(userId: string, predictions: Record<string, string>) {
  const all = loadPredictions();
  const idx = all.findIndex(p => p.userId === userId);
  const entry: UserPrediction = { userId, predictions, updatedAt: new Date().toISOString() };
  if (idx === -1) all.push(entry);
  else all[idx] = entry;
  savePredictions(all);
}

export function deleteUserPrediction(userId: string) {
  savePredictions(loadPredictions().filter(p => p.userId !== userId));
}
