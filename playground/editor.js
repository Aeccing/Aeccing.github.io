!((ctx) => {
  let editor;
  const CODE_KEY = "code",
    DEPENDENCIES_KEY = "dependencies";
  class Storage {
    constructor(options) {
      this.storeHandler = localStorage;
      this.getKeyHandler = (key) => `__${key}__`;
    }
    get(targetKey) {
      const key = this.getKeyHandler(targetKey);
      const orignalStore = this.storeHandler.getItem(key);
      const { value } = JSON.parse(orignalStore || "{}");
      return value;
    }
    set(targetKey, value) {
      const key = this.getKeyHandler(targetKey);
      this.storeHandler.setItem(key, JSON.stringify({ key, value }));
    }
    move(targetKey) {
      const key = this.getKeyHandler(targetKey);
      this.storeHandler.removeItem(key);
    }
  }
  const storage = new Storage();
  const getRequireCode = () => {
    return storage
      .get(DEPENDENCIES_KEY)
      ?.map((package) => {
        const { name, description, latest } = package;
        const _name = name?.split(".")[0];
        return `// @ts-ignore\nconst ${_name} = require('${_name}')`;
      })
      .map((str) => str.trimEnd())
      .join("\n");
  };
  ((...fns) => {
    for (let index = 0; index < fns.length; index++) {
      const fn = fns[index];
      if ("function" == typeof fn) fn();
    }
  })(
    function () {
      const execute = document.getElementById("execute");
      const output = document.querySelector("#console code");
      const reset = document.getElementById("reset");
      editor = monaco.editor.create(document.getElementById("editor"), {
        value: storage.get(CODE_KEY),
        language: "typescript",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        contextmenu: false,
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
              return data.length > 0
                ? type + " [" + r(data) + "]"
                : type + " []";
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
      const onLogOrError = () => {
        const console = ctx ? ctx.console : ctx.console,
          log = console.log,
          error = console.error;
        console.error = (err, ...args) => {
          console.info("报错了");
          error.apply(console, args);
          print(err);
        };
        console.log = (...args) => {
          const strs = args?.map((arg) => parseData(arg));
          log.apply(console, args);
          print(strs.join(" "));
        };
      };
      onLogOrError();
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
        try {
          new Function(jsLang)();
        } catch (error) {
          print(error);
          // console.info(error.toString());
        }
      });
      reset.addEventListener("click", () => ctx.location.reload());
      //添加按键监听
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        function () {
          //触发：格式化文档，更多支持项：editor._actions
          editor.trigger("a", "editor.action.formatDocument");
        }
      );
      //内容改变事件
      editor.onDidChangeModelContent(function (e) {
        storage.set(CODE_KEY, editor.getValue());
      });
    },
    function () {
      const search = document.getElementById("search");
      const selectedId = document.getElementById("selectedId");
      const packageSelect = document.getElementById("package-select");
      search.oninput = function getMoreContents() {
        //删除ul
        const drop = document.getElementById("drop");
        if (drop) {
          selectedId.removeChild(drop);
        }
        //把ul添加回来
        const originalUl = document.createElement("ul");
        originalUl.id = "drop";
        selectedId.appendChild(originalUl);
        fetch(
          `https://api.cdnjs.com/libraries?limit=10&fields=description&search=${search.value}`
        )
          .then((response) => response.json())
          .then((data) => {
            const { results } = data || {};
            for (let i = 0; i < results.length; i++) {
              const li = document.createElement("li");
              // li.innerHTML = storage
              //   .get(DEPENDENCIES_KEY)
              //   ?.some?.((dep) => dep.name === results[i]?.name)
              //   ? `${results[i]?.name}✓`
              //   : results[i]?.name;
              li.innerHTML = results[i]?.name;
              Object.entries(results[i])?.map(([key, value]) => {
                li.setAttribute(`data-${key}`, value);
              });
              document.getElementById("drop").appendChild(li);
            }
          });
      };
      // 添加获取焦点事件
      search.onfocus = function () {
        // if (!document.getElementById("drop")) {
        //   var originalUl = document.createElement("ul");
        //   originalUl.id = "drop";
        //   selectedId.appendChild(originalUl);
        // }
        // // 初始下拉列表
        // showList();
      };
      //添加失去焦点事件
      search.onblur = function () {
        setTimeout(() => {
          const drop = document.getElementById("drop");
          drop && selectedId.removeChild(drop);
          search.value = "";
        }, 200);
      };
      selectedId.onclick = function (event) {
        const currentTarget = event.target;
        // if (currentTarget.textContent.endsWith("✓")) {
        //   return;
        // }
        // storage.set(DEPENDENCIES_KEY, [
        //   ...(storage.get(DEPENDENCIES_KEY) || []),
        //   currentTarget.dataset,
        // ]);
        const drop = document.getElementById("drop");
        selectedId.removeChild(drop);
        search.value = "";
        appendPackageScript(currentTarget.dataset);
      };

      // packageSelect.oninput = (e) => {
      //   const package = storage
      //     .get(DEPENDENCIES_KEY)
      //     ?.find(({ name }) => name === e.target.value);
      //   const { name, description, latest } = package;
      //   if (name && latest) {
      //     const windowDefine = window.define;
      //     const my_define = (args) => windowDefine(name, args);
      //     my_define.amd = true;
      //     window.define = my_define;
      //     if (document.querySelector(".package")) {
      //       document.body.removeChild(document.querySelector(".package"));
      //     }
      //     const script = document.createElement("script");
      //     script.setAttribute("class", "package");
      //     script.setAttribute("async", "async");
      //     script.setAttribute("type", "text/javascript");
      //     script.setAttribute("src", latest);
      //     document.body.appendChild(script);
      //     script.onload = () => {
      //       window.define = windowDefine;
      //     };
      //   }
      // };
      const appendPackageScript = async (package) => {
        console.info(package);
        const { name, description, latest } = package;
        const defineSnapshot = ctx.define;
        ctx.define = (args) => defineSnapshot(name?.split(".")[0], args);
        ctx.define.amd = { editor: true };
        const appendScript = ({ src }) => {
          return new Promise(async (resolve) => {
            const script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("async", "async");
            script.setAttribute("src", src);
            document.body.appendChild(script);
            script.onload = () => resolve();
          });
        };
        await appendScript({ src: latest });
        ctx.define = defineSnapshot;
      };
      const appendPackageButton = () => {
        const packages = document.getElementById("packages");
        storage.get(DEPENDENCIES_KEY)?.map((package) => {
          const { name, description, latest } = package;
          const button = document.createElement("button");
          Object.entries(package)?.map(([key, value]) => {
            button.setAttribute(`data-${key}`, value);
          });
          button.textContent = name;
          packages.appendChild(button);
        });
        packages.onclick = (e) => {
          console.info(e.target?.dataset);
        };
      };
      // appendPackageButton();
    }
  );
})(this);
