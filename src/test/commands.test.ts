import * as assert from "assert";
import { run, execute } from "../extension/commands";

suite("run", () => {
  const result = async () => "RESULT";
  const scope = async () => true;
  const scopeFalse = async () => false;
  const command = { command: "command", args: "ARGS", scope: "SCOPE" };

  test("returns run result", async () => {
    assert.equal("RESULT", await run(result, scope, command));
  });

  test("passes command to executor", async () => {
    const result: any = [];
    await run((...args) => result.push(args), scope, command);
    assert.deepEqual([["command", "ARGS"]], result);
  });

  test("checks scope", async () => {
    const result: any = [];
    await run((...args) => result.push(args), scopeFalse, command);
    assert.deepEqual([], result);
  });

  test("passes scope args to scope checker", async () => {
    const actual: any = [];
    await run(result, (...args) => actual.push(args), command);
    assert.deepEqual([["SCOPE"]], actual);
  });

  test("runs two commands", async () => {
    assert.deepEqual(
      "RESULT",
      await run(result, scope, { commands: [command, command] }),
    );
  });

  test("checks global scope", async () => {
    assert.deepEqual(
      undefined,
      await run(result, scopeFalse, { commands: [command], scope: "SCOPE" }),
    );
  });

  test("checks scope for each command", async () => {
    assert.deepEqual(
      "RESULT",
      await run(result, async (scope) => (scope === "SCOPE" ? false : true), {
        commands: [command, { ...command, scope: "SCOPE_2" }],
      }),
    );
  });

  test("passes scope arguments for first command", async () => {
    const actual: any = [];

    await run(result, (...args) => actual.push(args), {
      commands: [command, { ...command, scope: "SCOPE_2" }],
    });

    assert.deepEqual([["SCOPE"]], actual);
  });
});

suite("execute", () => {
  const result = async () => "RESULT";
  const scope = async () => true;
  const scopeFalse = async () => false;
  const command = { command: "command", args: "ARGS", scope: "SCOPE" };

  test("returns run result", async () => {
    assert.equal("RESULT", await execute(result, scope, command));
  });

  test("passes command to executor", async () => {
    const result: any = [];
    await execute((...args) => result.push(args), scope, command);
    assert.deepEqual([["command", "ARGS"]], result);
  });

  test("checks scope", async () => {
    const result: any = [];
    await execute((...args) => result.push(args), scopeFalse, command);
    assert.deepEqual([], result);
  });

  test("passes scope args to scope checker", async () => {
    const actual: any = [];
    await execute(result, (...args) => actual.push(args), command);
    assert.deepEqual([["SCOPE"]], actual);
  });

  test("runs two commands", async () => {
    assert.deepEqual(
      ["RESULT", "RESULT"],
      await execute(result, scope, { commands: [command, command] }),
    );
  });

  test("checks global scope", async () => {
    assert.deepEqual(
      undefined,
      await execute(result, scopeFalse, {
        commands: [command],
        scope: "SCOPE",
      }),
    );
  });

  test("checks scope for each command", async () => {
    assert.deepEqual(
      ["RESULT", undefined],
      await execute(
        result,
        async (scope) => (scope === "SCOPE" ? true : false),
        { commands: [command, { ...command, scope: "SCOPE_2" }] },
      ),
    );
  });

  test("passes scope arguments for each command", async () => {
    const actual: any = [];

    await execute(result, (...args) => actual.push(args), {
      commands: [command, { ...command, scope: "SCOPE_2" }],
    });

    assert.deepEqual([["SCOPE"], ["SCOPE_2"]], actual);
  });
});
