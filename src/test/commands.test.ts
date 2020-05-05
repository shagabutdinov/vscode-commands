import * as assert from "assert";
import * as sinon from "sinon";
import { Document } from "extension/lib/types";
import { runAsync as run, executeAsync as execute } from "extension/commands";

const selection = {
  active: { line: 1, character: 0 },
  anchor: { line: 1, character: 0 },
};

let invoke = sinon.stub();
let checkContext = sinon.stub();
let getSelections = sinon.stub();
let setSelections = sinon.stub();

const document: Document = {
  commands: {},
  execute: invoke,
  checkContext,
  getSelections,
  setSelections,
};

suite("commands", () => {
  setup(() => {
    invoke = sinon.stub().returns("RESULT");
    document.execute = invoke;
    checkContext = sinon.stub().returns(true);
    document.checkContext = checkContext;
    setSelections = sinon.stub();
    document.setSelections = setSelections;
    getSelections = sinon.stub().returns([]);
    document.getSelections = getSelections;
  });

  suite("run", () => {
    const command = { command: "command", args: "ARGS", context: "CONTEXT" };

    test("returns run result", async () => {
      assert.equal("RESULT", await run(document, command));
    });

    test("passes command to executor", async () => {
      await run(document, command);
      assert.deepEqual(["command", "ARGS"], invoke.getCall(0).args);
    });

    test("checks context", async () => {
      checkContext.returns(false);
      await run(document, command);
      assert.deepEqual(false, invoke.called);
    });

    test("passes context args to context checker", async () => {
      await run(document, command);
      assert.deepEqual(["CONTEXT"], checkContext.getCall(0).args);
    });

    test("runs two commands", async () => {
      assert.deepEqual(
        "RESULT",
        await run(document, { commands: [command, command] }),
      );
    });

    test("checks global context", async () => {
      checkContext.returns(false);
      assert.deepEqual(
        undefined,
        await run(document, { commands: [command], context: "CONTEXT" }),
      );
    });

    test("checks context for each command", async () => {
      checkContext.withArgs("CONTEXT_1").returns(false);
      checkContext.withArgs("CONTEXT_2").returns(true);

      assert.deepEqual(
        "RESULT",
        await run(document, {
          commands: [
            { ...command, context: "CONTEXT_1" },
            { ...command, context: "CONTEXT_2" },
          ],
        }),
      );
    });

    test("passes context arguments for first command", async () => {
      await run(document, {
        commands: [command, { ...command, context: "CONTEXT_2" }],
      });

      assert.deepEqual(["CONTEXT"], checkContext.getCall(0).args);
    });

    test("does not run if no selections", async () => {
      await run(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(false, invoke.called);
    });

    test("runs one time for the selection", async () => {
      getSelections.returns([selection]);
      await run(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(1, invoke.callCount);
    });

    test("runs two times for the selection", async () => {
      getSelections.returns([selection, selection]);
      await run(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(2, invoke.callCount);
    });

    test("sets single selection to document", async () => {
      getSelections.returns([selection, selection]);
      await run(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual([[selection]], setSelections.getCall(0).args);
    });

    test("sets modified selection back to document", async () => {
      getSelections.returns([selection, selection]);

      getSelections
        .onThirdCall()
        .returns([{ ...selection, anchor: { line: 2, character: 0 } }]);

      await run(document, { forEachSelection: true, commands: [command] });

      assert.deepEqual(
        [[{ ...selection, anchor: { line: 2, character: 0 } }, selection]],
        setSelections.getCall(2).args,
      );
    });
  });

  suite("execute", () => {
    const command = { command: "command", args: "ARGS", context: "CONTEXT" };

    test("returns run result", async () => {
      assert.equal("RESULT", await invoke(document, command));
    });

    test("passes command to executor", async () => {
      await execute(document, command);
      assert.deepEqual(["command", "ARGS"], invoke.getCall(0).args);
    });

    test("checks context", async () => {
      checkContext.returns(false);
      await execute(document, command);
      assert.deepEqual(false, invoke.called);
    });

    test("passes context args to context checker", async () => {
      await execute(document, command);
      assert.deepEqual(["CONTEXT"], checkContext.getCall(0).args);
    });

    test("runs two commands", async () => {
      assert.deepEqual(
        ["RESULT", "RESULT"],
        await execute(document, { commands: [command, command] }),
      );
    });

    test("checks global context", async () => {
      checkContext.returns(false);

      assert.deepEqual(
        undefined,
        await execute(document, { commands: [command], context: "CONTEXT" }),
      );
    });

    test("checks context for each command", async () => {
      checkContext.withArgs("CONTEXT_1").returns(false);
      checkContext.withArgs("CONTEXT_2").returns(true);

      assert.deepEqual(
        [undefined, "RESULT"],
        await execute(document, {
          commands: [
            { ...command, context: "CONTEXT_1" },
            { ...command, context: "CONTEXT_2" },
          ],
        }),
      );
    });

    test("passes context arguments for each command", async () => {
      await execute(document, {
        commands: [
          { ...command, context: "CONTEXT_1" },
          { ...command, context: "CONTEXT_2" },
        ],
      });

      assert.deepEqual(["CONTEXT_1"], checkContext.getCall(0).args);
      assert.deepEqual(["CONTEXT_2"], checkContext.getCall(1).args);
    });

    test("does not run if no selections", async () => {
      await execute(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(false, invoke.called);
    });

    test("runs one time for the selection", async () => {
      getSelections.returns([selection]);
      await execute(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(1, invoke.callCount);
    });

    test("runs two times for the selection", async () => {
      getSelections.returns([selection, selection]);
      await execute(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual(2, invoke.callCount);
    });

    test("sets single selection to document", async () => {
      getSelections.returns([selection, selection]);
      await execute(document, { forEachSelection: true, commands: [command] });
      assert.deepEqual([[selection]], setSelections.getCall(0).args);
    });

    test("sets modified selection back to document", async () => {
      getSelections.returns([selection, selection]);

      getSelections
        .onThirdCall()
        .returns([{ ...selection, anchor: { line: 2, character: 0 } }]);

      await execute(document, { forEachSelection: true, commands: [command] });

      assert.deepEqual(
        [[{ ...selection, anchor: { line: 2, character: 0 } }, selection]],
        setSelections.getCall(2).args,
      );
    });
  });
});
