!(function () {
  let htmlEditor, cssEditor, jsEditor;
  const outputIframe = document.getElementById("output-iframe");
  const editorContainer = document.getElementById("editor-container");
  const outputhHeader = document.querySelector(".output-header");
  const clear = document.getElementById("clear");
  const cssEditorEl = document.getElementById("css-editor");
  const htmlEditorEl = document.getElementById("html-editor");
  const jsEditorEl = document.getElementById("js-editor");
  const cssEditorPreEl = cssEditorEl.querySelector("pre");
  const htmlEditorPreEl = htmlEditorEl.querySelector("pre");
  const jsEditorPreEl = jsEditorEl.querySelector("pre");
  const outputHead = document.getElementById("output-head");
  const outputBody = document.getElementById("output-body");
  const tabContainer = document.getElementById("tab-container");
  const tabButton = tabContainer.querySelectorAll('button[role="tab"]');
  const tablist = document.getElementById("tablist");
  const iframeContent = `\n<!DOCTYPE html>\n<html id="output-root">\n<head>${outputHead.innerHTML}</head>\n<body>${outputBody.innerHTML}</body>\n</html>\n`;
  const run = document.getElementById("run");
  let timer;
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

  function g(e, t) {
    t && (t.setAttribute("aria-selected", !1), t.setAttribute("tabindex", -1)),
      e.setAttribute("aria-selected", !0),
      e.removeAttribute("tabindex"),
      e.focus();
  }
  function p(key) {
    const t = tablist.querySelector('button[aria-selected="true"]');
    ("forward" !== key && "reverse" !== key) ||
      ("forward" === key
        ? t.nextElementSibling
          ? (g(t.nextElementSibling, t), t.nextElementSibling.click())
          : (g(tabButton[0]), tabButton[0].click())
        : "reverse" === key &&
          (t.previousElementSibling
            ? (g(t.previousElementSibling, t), t.previousElementSibling.click())
            : (g(tabButton[tabButton.length - 1]),
              tabButton[tabButton.length - 1].click())));
  }
  function tablistAddEventListener() {
    tablist.addEventListener("click", (e) => {
      const target = e.target;
      if ("tab" === target.getAttribute("role")) {
        const selectedTab = tablist.querySelector(
          'button[aria-selected="true"]'
        );
        const selectedTabPanel = document.getElementById(
          target.getAttribute("aria-controls")
        );
        const allTabPanel = tabContainer.querySelectorAll('[role="tabpanel"]');
        for (const e of allTabPanel) e.classList.add("hidden");
        g(target, selectedTab);
        selectedTabPanel.classList.remove("hidden");
        selectedTabPanel.setAttribute("aria-hidden", false);
      }
    });
    tablist.addEventListener("keyup", (e) => {
      switch ((e.stopPropagation(), e.key)) {
        case "ArrowRight":
        case "ArrowDown":
          p("forward");
          break;
        case "ArrowLeft":
        case "ArrowUp":
          p("reverse");
          break;
        case "Home":
          g(tabButton[0]);
          break;
        case "End":
          g(tabButton[tabButton.length - 1]);
          break;
        case "default":
          return;
      }
    });
  }
  function writeIframe() {
    const contentMap = {
      htmlContent: htmlEditor.getValue(),
      cssContent: cssEditor.getValue(),
      jsContent: jsEditor.getValue(),
    };
    storage.set("cssContent", contentMap.cssContent);
    storage.set("htmlContent", contentMap.htmlContent);
    storage.set("jsContent", contentMap.jsContent);
    const srcdoc = iframeContent
      .replace("/* css-content */", contentMap.cssContent)
      ?.replace("<!-- html-content -->", contentMap.htmlContent)
      .replace("/* js-content */", contentMap.jsContent);
    const ifrw = outputIframe.contentWindow
      ? outputIframe.contentWindow
      : outputIframe.contentDocument.document
      ? outputIframe.contentDocument.document
      : outputIframe.contentDocument;
    ifrw.document.open();
    ifrw.document.write(srcdoc);
    ifrw.document.close();
    // outputIframe.srcdoc = srcdoc;
  }
  function debounceWriteIframe() {
    clearTimeout(timer);
    timer = setTimeout(() => writeIframe(), 200);
  }
  function createEditor() {
    [htmlEditor, cssEditor, jsEditor] = [
      { language: "html", el: htmlEditorEl, content: "htmlContent" },
      { language: "css", el: cssEditorEl, content: "cssContent" },
      { language: "javascript", el: jsEditorEl, content: "jsContent" },
    ].map(({ language, el, content }) => {
      return monaco.editor.create(el, {
        value: storage.get(content),
        language: language,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        contextmenu: false,
        minimap: { enabled: false },
      });
    });
    jsEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      htmlEditor.trigger("a", "editor.action.formatDocument");
      cssEditor.trigger("a", "editor.action.formatDocument");
      jsEditor.trigger("a", "editor.action.formatDocument");
    });
  }

  run.addEventListener("click", writeIframe);
  outputIframe.addEventListener("load", () => {
    const contentWindow = outputIframe.contentWindow,
      body = contentWindow.document.body;
    contentWindow?.executeExample?.();
  });
  outputhHeader.addEventListener("click", (e) => {
    e.target.classList.contains("reset") && window.location.reload();
  });
  clear.addEventListener("click", () => {
    document.querySelector("#console code").textContent = "";
  });
  editorContainer.classList.remove("hidden");
  const showTabs = (function (e) {
    return e.dataset && e.dataset.tabs
      ? e.dataset.tabs.split(",")
      : ["html", "css", "js"];
  })(editorContainer);
  const defaultTab = (function (e, t) {
    return e.dataset && e.dataset.defaultTab
      ? e.dataset.defaultTab
      : t.includes("js")
      ? "js"
      : "html";
  })(editorContainer, showTabs);
  (function (tabs, defaultTabEl) {
    if (defaultTabEl) {
      const defaultTabPanelEl = document.getElementById(
        defaultTabEl.id + "-panel"
      );
      defaultTabEl.setAttribute("aria-selected", !0);
      defaultTabEl.removeAttribute("tabindex");
      defaultTabPanelEl.classList.remove("hidden");
      defaultTabPanelEl.setAttribute("aria-hidden", false);
      defaultTabEl.focus();
    }
    for (const tab of tabs) {
      document.getElementById(tab).classList.remove("hidden");
    }
  })(showTabs, document.getElementById(defaultTab));
  tablistAddEventListener();
  createEditor();
  writeIframe();
})();
