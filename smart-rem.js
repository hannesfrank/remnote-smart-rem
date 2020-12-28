async function f() {
  const REM_ID_LENGTH = 17;
  const SMART_REM_PREFIX = ">>>";

  function matchRegex(regex) {
    return (el) => {
      const smartCommandText = el.remData.key[0]
        .slice(SMART_REM_PREFIX.length)
        .trim();
      return regex.exec(smartCommandText);
    };
  }

  const smartCommands = [
    {
      matcher: matchRegex(/^=(.*)/),
      handler: async (match, el) => {
        console.info(el.remData);
        const result = eval(match[1]);
        // console.info('Calc: ', match, ' = ', result);
        return result;
      },
    },
    {
      matcher: matchRegex(/^spotify:\s*(.+)/),
      handler: async (match) =>
        `<iframe src="https://open.spotify.com/embed/${match[1]}" width="300" height="380"></iframe>`,
    },
    {
      matcher: matchRegex(/^embed:\s*(.+)/),
      handler: async (match) =>
        `<iframe src="https://${match[1]}" width="750" height="500"></iframe>`,
    },
    {
      matcher: matchRegex(/^weather:\s*(.+)/),
      handler: async (match) =>
        `<img src="https://wttr.in/${match[1]}_tpq0.png" />`,
      /* handler: async match => {
        const resp = await fetch("https://wttr.in/Dresden");
        const text = await resp.text();
        console.warn(text);
        return `${text}`;
    }*/
    },
    {
      matcher: matchRegex(/^chucknorris/),
      handler: async (match) => {
        const resp = await fetch("https://api.chucknorris.io/jokes/random");
        const json = await resp.json();
        return `<p>🧔 ${json.value}</p>`;
      },
    },
    {
      matcher: matchRegex(/^current ip/),
      handler: async (match) => {
        const resp = await fetch("https://api.ipify.org/?format=json");
        const json = await resp.json();
        // return `<p>💻 ${json.ip}</p>`;
        return `<p>💻 1.3.3.7</p>`;
      },
    },
    {
      matcher: matchRegex(/^zip code:\s*(.+)/),
      handler: async (match) => {
        const resp = await fetch(`https://api.zippopotam.us/${match[1]}`);
        const json = await resp.json();
        if (!json.places) {
          return `<p>Not found!</p>`;
        }
        return `<p>${json.places[0]["place name"]}, ${json.country}</p>`;
      },
    },
    {
      matcher: matchRegex(/^xkcd/),
      handler: async (match) => {
        console.warn("xkcd");
        const resp = await fetch("https://xkcd.now.sh/?comic=latest");
        const json = await resp.json();
        console.warn(json);
        return `<img src="${json.img}" />`;
      },
    },
    {
      matcher: matchRegex(/^html:\s*(.+)/),
      handler: async (match) => {
        return `${match[1]}`;
      },
    },
    {
      matcher: matchRegex(/^markdown:\s*(.+)/s),
      handler: async (match) => {
        const markdown = match[1];
        console.warn("markdown", markdown);
        const html = new showdown.Converter({ tables: true }).makeHtml(
          markdown
        );
        return html;
      },
    },
    {
      matcher: matchRegex(/^regex matching the smart command/),
      handler:
        "async function taking the smart block content and returning result markup",
    },
  ];

  function findAllRem() {
    return [...document.querySelectorAll("[id^=Pane][id$=REM]")];
  }

  function remId(remEl) {
    return remEl.id.slice(
      remEl.id.length - 3 - REM_ID_LENGTH,
      remEl.id.length - 3
    );
  }

  function isSmartRem(el) {
    // TODO: This works only for plain text, not bold formatting etc.
    const rem = el.remData;
    return (
      rem &&
      rem.key.length &&
      rem.key[0].startsWith &&
      rem.key[0].startsWith(">>>")
    );
  }

  async function updateRemData(el) {
    el.remData = await db.get("quanta", remId(el));
  }

  // Life Cycle Polyfill
  // Rem is created
  function onCreate(el) {
    console.info("onCreate", el.id);
  }

  // The rem is discovered, e.g. after reloading the page or navigating
  async function onInsert(el) {
    await updateRemData(el);

    if (isSmartRem(el)) {
      prepareSmartRem(el);
      await evaluateSmartRem(el);
    }
  }

  // Rem is deleted
  function onDelete(el) {
    // For this I need to store a set of references to elements and check if the an element of the new collection was already present
    // I don't need this yet, so I will not other.
    console.info("onDelete", el.id);
  }

  // Rem is focused for editing
  function onFocusIn(el) {
    console.info("onFocusIn", el.id);
  }

  // Rem is unfocused
  async function onFocusOut(el) {
    await updateRemData(el);
    console.info("onFocusOut", el, el.remData, el.remSmartResult);
    if (isSmartRem(el)) {
      await evaluateSmartRem(el);
    } else {
      resetRem(el);
    }
  }

  // Rem content changed
  function onChange(el) {
    // I assume this can only happen if a rem is focused for now (no plugin etc.)
    // Here I need to check periodically if the new content is the old content
    // For that the old and new content has to be compared
    // I will moch this for now as running periodically.
    console.info("onChange", el.id);
  }

  function prepareSmartRem(el) {
    // add evaluate button
    // add result container
    // add events to watch or recalculate rem
    // TODO: These hooks should be provided by the API
    setResult(el, "?");
  }

  // This function is run periodically on all rem.
  async function prepareLifeCylce(el) {
    if (el.remLifeCycleHooks !== undefined) {
      // Old rem: hooks already installed
      return;
    }
    el.remLifeCycleHooks = {};
    await onInsert(el);

    // TODO: Focus in should run change handler
    el.remLifeCycleHooks.focusin = el.addEventListener("focusin", (event) =>
      onFocusIn(el, event)
    );
    el.remLifeCycleHooks.focusout = el.addEventListener("focusout", (event) =>
      onFocusOut(el, event)
    );
    // TODO: Change handler or focusOut should check if it is a smartRem or not

    // TODO: Monitor new rems or when a rem is turned into a smart rem
  }

  function setResult(el, resultMarkup) {
    if (el.remSmartResult) {
      el.remSmartResult.remove();
      delete el.remSmartResult;
    }
    const result = makeResult(resultMarkup);
    el.remSmartResult = result;
    el.append(result);
  }

  function makeResult(resultMarkup) {
    const resultTemplate = document.createElement("template");
    resultTemplate.innerHTML = `<div class="smart-rem-result">${resultMarkup}</div>`;
    return resultTemplate.content.firstChild;
  }

  async function evaluateSmartRem(el) {
    for (const smartCommand of smartCommands) {
      const match = smartCommand.matcher(el);
      if (match) {
        const result = await smartCommand.handler(match, el);
        setResult(el, result);
        return;
      }
    }
    setResult(el, "? Command not found!");
  }

  Promise.all([
    import("https://unpkg.com/idb?module"),
    fetch("https://unpkg.com/showdown")
      .then((response) => response.text())
      .then((text) => Function(text)),
    // Somehow this import does not work... I'll use builtin eval for now
    //fetch("https://unpkg.com/bigeval").then(response=>response.text()).then(text=>Function(text))
  ]).then(async ([idb, sd]) => {
    sd();
    db = await idb.openDB("lnotes", 24);

    let rems = await findAllRem();
    rems.map(resetRem);
    await Promise.all(rems.map(prepareLifeCylce));

    // FIXME: This is run to detect new rem. I have not hooked up the created hook yet.
    setInterval(async function () {
      const rems = await findAllRem();
      await Promise.all(rems.map(prepareLifeCylce));
    }, 2000);
  });
}

function resetRem(el) {
  delete el.remData;
  if (el.remLifeCycleHooks) {
    for (const [event, hook] of Object.entries(el.remLifeCycleHooks)) {
      el.removeEventListener(event, hook);
    }
  }
  delete el.remLifeCycleHooks;
  if (el.remSmartResult) el.remSmartResult.remove();
}

f();
