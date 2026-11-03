import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const css = read("../index.css");
const agenda = read("../pages/Agenda.tsx");
const register = read("../pages/Register.tsx");
const html = read("../../index.html");
const tw = read("../../tailwind.config.ts");

test("btn-brand is the pink-to-purple gradient (founder ruling 2026-10-24)", () => {
  const m = css.match(/\.btn-brand\s*\{([^}]*)\}/);
  assert.ok(m, ".btn-brand missing");
  assert.ok(m[1].includes("from-pink-500"));
  assert.ok(m[1].includes("to-purple-600"));
  assert.ok(m[1].includes("hover:from-pink-600 hover:to-purple-700 text-white"));
});

test("Register keeps its own original gradient from 1567e9a", () => {
  assert.ok(register.includes("w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-2 rounded-lg transition-all duration-200 hover:shadow-lg"));
});

test("Agenda toggle keeps the Basic/Advanced wording from before 1567e9a", () => {
  assert.ok(agenda.includes('{isAdvancedView ? "Switch to Basic View" : "Switch to Advanced View"}'));
  assert.ok(agenda.includes('{isAdvancedView ? "Basic" : "Advanced"}'));
  assert.ok(!agenda.includes("Show details"));
});

test("original look: Georgia and Dancing Script stay", () => {
  assert.ok(css.includes("Georgia"));
  assert.ok(tw.includes("Georgia"));
  assert.ok(tw.includes("Dancing Script"));
});

test("the only fonts.googleapis.com reference is the Dancing Script link", () => {
  const refs = html.match(/https:\/\/fonts\.googleapis\.com[^"']*/g) || [];
  assert.deepEqual(refs, ["https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap"]);
});
