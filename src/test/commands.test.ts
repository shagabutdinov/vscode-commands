import * as assert from "assert";
import * as sinon from "sinon";
import { run, execute, Document } from "../extension/commands";

const selection = {
  active: { line: 1, character: 0 },
  anchor: { line: 1, character: 0 },
};

let invoke = sinon.stub();
let checkScope = sinon.stub();
let getSelections = sinon.stub();
let setSelections = sinon.stub();

const document: Document = {
  execute: invoke,
  checkScope,
  getSelections,
  setSelections,
};

suite("commands", () => {
  setup(() => {
    invoke = sinon.stub().returns("RESULT");
    document.execute = invoke;
    checkScope = sinon.stub().returns(true);
    document.checkScope = checkScope;
    setSelections = sinon.stub();
    document.setSelections = setSelections;
    getSelections = sinon.stub().returns([]);
    document.getSelections = getSelections;
  });

  suite("run", () => {
    const command = { command: "command", args: "ARGS", scope: "SCOPE" };

    test("returns run result", async () => {
      assert.equal("RESULT", await run(document, command));
    });

    test("passes command to executor", async () => {
      await run(document, command);
      assert.deepEqual(["command", "ARGS"], invoke.getCall(0).args);
    });

    test("checks scope", async () => {
      checkScope.returns(false);
      await run(document, command);
      assert.deepEqual(false, invoke.called);
    });

    test("passes scope args to scope checker", async () => {
      await run(document, command);
      assert.deepEqual(["SCOPE"], checkScope.getCall(0).args);
    });

    test("runs two commands", async () => {
      assert.deepEqual(
        "RESULT",
        await run(document, { commands: [command, command] }),
      );
    });

    test("checks global scope", async () => {
      checkScope.returns(false);
      assert.deepEqual(
        undefined,
        await run(document, { commands: [command], scope: "SCOPE" }),
      );
    });

    test("checks scope for each command", async () => {
      checkScope.withArgs("SCOPE_1").returns(false);
      checkScope.withArgs("SCOPE_2").returns(true);

      assert.deepEqual(
        "RESULT",
        await run(document, {
          commands: [
            { ...command, scope: "SCOPE_1" },
            { ...command, scope: "SCOPE_2" },
          ],
        }),
      );
    });

    test("passes scope arguments for first command", async () => {
      await run(document, {
        commands: [command, { ...command, scope: "SCOPE_2" }],
      });

      assert.deepEqual(["SCOPE"], checkScope.getCall(0).args);
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
    const command = { command: "command", args: "ARGS", scope: "SCOPE" };

    test("returns run result", async () => {
      assert.equal("RESULT", await invoke(document, command));
    });

    test("passes command to executor", async () => {
      await execute(document, command);
      assert.deepEqual(["command", "ARGS"], invoke.getCall(0).args);
    });

    test("checks scope", async () => {
      checkScope.returns(false);
      await execute(document, command);
      assert.deepEqual(false, invoke.called);
    });

    test("passes scope args to scope checker", async () => {
      await execute(document, command);
      assert.deepEqual(["SCOPE"], checkScope.getCall(0).args);
    });

    test("runs two commands", async () => {
      assert.deepEqual(
        ["RESULT", "RESULT"],
        await execute(document, { commands: [command, command] }),
      );
    });

    test("checks global scope", async () => {
      checkScope.returns(false);

      assert.deepEqual(
        undefined,
        await execute(document, { commands: [command], scope: "SCOPE" }),
      );
    });

    test("checks scope for each command", async () => {
      checkScope.withArgs("SCOPE_1").returns(false);
      checkScope.withArgs("SCOPE_2").returns(true);

      assert.deepEqual(
        [undefined, "RESULT"],
        await execute(document, {
          commands: [
            { ...command, scope: "SCOPE_1" },
            { ...command, scope: "SCOPE_2" },
          ],
        }),
      );
    });

    test("passes scope arguments for each command", async () => {
      await execute(document, {
        commands: [
          { ...command, scope: "SCOPE_1" },
          { ...command, scope: "SCOPE_2" },
        ],
      });

      assert.deepEqual(["SCOPE_1"], checkScope.getCall(0).args);
      assert.deepEqual(["SCOPE_2"], checkScope.getCall(1).args);
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
