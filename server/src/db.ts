import fs from "fs";
import path from "path";
import crypto from "crypto";
import { type MatchResult } from "./data/worldcup2026";

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
    createdAt: new Date().toISOString(),
  };
  users.push(user);
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

// Cached probability
interface CachedProbability {
  probability: number;
  koreaPosition: number;
  calculatedAt: string;
}

export function loadCachedProbability(): CachedProbability | null {
  return loadJSON("probability_cache.json", null);
}

export function saveCachedProbability(p: CachedProbability) {
  saveJSON("probability_cache.json", p);
}
