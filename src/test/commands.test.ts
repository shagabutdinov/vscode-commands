import * as assert from "assert";
import { run } from "../extension/commands";

suite("run", () => {
  const result = async () => "RESULT";
  const context = async () => true;
  const contextFalse = async () => false;
  const command = { command: "command", args: "ARGS", context: "CONTEXT" };

  test("returns run result", async () => {
    assert.equal("RESULT", await run(result, context, command));
  });

  test("passes command to executor", async () => {
    const result: any = [];
    await run((...args) => result.push(args), context, command);
    assert.deepEqual([["command", "ARGS"]], result);
  });

  test("checks context", async () => {
    const result: any = [];
    await run((...args) => result.push(args), contextFalse, command);
    assert.deepEqual([], result);
  });

  test("passes context args to context checker", async () => {
    const actual: any = [];
    await run(result, (...args) => actual.push(args), command);
    assert.deepEqual([["CONTEXT"]], actual);
  });

  test("runs two commands", async () => {
    assert.deepEqual(
      ["RESULT", "RESULT"],
      await run(result, context, { commands: [command, command] }),
    );
  });

  test("checks global context", async () => {
    assert.deepEqual(
      undefined,
      await run(result, contextFalse, {
        commands: [command],
        context: "CONTEXT",
      }),
    );
  });

  test("checks context for each command", async () => {
    assert.deepEqual(
      ["RESULT", undefined],
      await run(
        result,
        async context => (context === "CONTEXT" ? true : false),
        { commands: [command, { ...command, context: "CONTEXT_2" }] },
      ),
    );
  });

  test("passes context arguments for each command", async () => {
    const actual: any = [];

    await run(result, (...args) => actual.push(args), {
      commands: [command, { ...command, context: "CONTEXT_2" }],
    });

    assert.deepEqual([["CONTEXT"], ["CONTEXT_2"]], actual);
  });
});
