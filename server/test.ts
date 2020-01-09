import {
  assertEquals,
  test,
  runIfMain,
} from "https://deno.land/std/testing/mod.ts";

test(function t1() {
  assertEquals("hello", "hello");
});

test(function t2() {
  assertEquals("world", "world");
});

runIfMain(import.meta);
