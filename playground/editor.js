(() => {
  const execute = document.getElementById("execute");
  const output = document.querySelector("#console code");
  const reset = document.getElementById("reset");
  const editor = monaco.editor.create(document.getElementById("editor"), {
    value: localStorage.getItem("script-history"),
    language: "typescript",
    automaticLayout: true,
    scrollBeyondLastLine: false,
  });
  function print(logStr) {
    const oldStr = output.textContent;
    const newStr = "> " + logStr + "\n";
    output.textContent = oldStr + newStr;
  }
  function parseArrayData(data) {
    let ret = "";
    for (let index = 0, len = data.length; index < len; index++) {
      if ("string" == typeof data[index]) {
        ret += '"' + data[index] + '"';
      } else if (Array.isArray(data[index])) {
        ret += "["; //((ret += "Array [");
        ret += parseArrayData(data[index]);
        ret += "]";
      } else {
        ret += parseData(data[index]);
      }
      index < data.length - 1 && (ret += ", ");
    }
    return ret;
  }
  function parseData(data) {
    if (null == data || "boolean" == typeof data) {
      return String(data);
    } else if ("number" == typeof data) {
      return Object.is(data, -0) ? "-0" : String(data);
    } else if ("bigint" == typeof data) {
      return String(data) + "n";
    } else if ("string" == typeof data) {
      return data.includes('"') ? "'" + data + "'" : '"' + data + '"';
    } else if (Array.isArray(data)) {
      return "[" + parseArrayData(data) + "]";
      // return "Array [" + parseArrayData(data) + "]"
    } else {
      return (function (data) {
        const type = data.constructor ? data.constructor.name : data;
        if ("String" === type) return `String { "${data.valueOf()}" }`;
        if (data === JSON) return "JSON {}";
        if (
          type.match &&
          type.match(/^(ArrayBuffer|SharedArrayBuffer|DataView)$/)
        )
          return type + " {}";
        if (
          type.match &&
          type.match(
            /^(Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array|BigInt64Array|BigUint64Array)$/
          )
        )
          return data.length > 0 ? type + " [" + r(data) + "]" : type + " []";
        if ("Symbol" === type && void 0 !== data) return data.toString();
        if ("Object" === type) {
          let str = "",
            flag = !0;
          for (const key in data)
            Object.prototype.hasOwnProperty.call(data, key) &&
              (flag ? (flag = !1) : (str += ", "),
              (str = str + key + ": " + parseData(data[key])));
          return "{ " + str + " }";
          // return type + " { " + str + " }";
        }
        if (!data.constructor && !data.prototype) {
          let str = "",
            flag = !0;
          for (const key in data)
            flag ? (flag = !1) : (str += ", "),
              (str = str + key + ": " + parseData(data[key]));
          return "{ " + str + " }";
          // return "Object { " + str + " }";
        }
        return data;
      })(data);
    }
  }
  const onLogOrError = (ctx) => {
    const console = ctx ? ctx.console : window.console,
      log = console.log,
      error = console.error;
    console.error = (err, ...args) => {
      error.apply(console, args);
      print(err);
    };
    console.log = (...args) => {
      const strs = args?.map((arg) => parseData(arg));
      log.apply(console, args);
      print(strs.join(" "));
    };
  };
  const getEmitResult = async () => {
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await worker();
    const model = editor.getModel();
    const result = await client.getEmitOutput(model.uri.toString());
    const firstJS = result.outputFiles.find((o) => o.name.endsWith(".js"));
    return firstJS?.text;
  };
  execute.addEventListener("click", async () => {
    output.textContent = "";
    const jsLang = await getEmitResult();
    new Function(jsLang)();
  });
  reset.addEventListener("click", () => window.location.reload());
  onLogOrError();
  //添加按键监听
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    //触发：格式化文档，更多支持项：editor._actions
    editor.trigger("a", "editor.action.formatDocument");
  });
  //内容改变事件
  editor.onDidChangeModelContent(function (e) {
    localStorage.setItem("script-history", editor.getValue());
  });
})();
