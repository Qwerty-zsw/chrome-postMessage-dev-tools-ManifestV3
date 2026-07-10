const headerRowId = "header-row";
const isDarkTheme = chrome.devtools.panels.themeName === "dark";
const themeClassName = isDarkTheme ? "dark" : "default";

const setHeaderRowColor = () => {
  const headerRow = document.querySelector('#header-row');
  headerRow.className = themeClassName;
}

const addControllBarAction = () => {
    const clearBtn = document.querySelector('#clear-content')
    const tableBody = document.querySelector('#post-message-table-body');
    clearBtn.addEventListener('click', e => {
        tableBody.innerHTML = ''
    })
}

const addTableRow = (origin, data) => {
  try {
    const tableBody = document.querySelector('#post-message-table-body');
    const row = document.createElement('tr');
    row.className = themeClassName;

    const originCell = document.createElement('td');
    const dataCell = document.createElement('td');

    originCell.innerText = origin;
    dataCell.innerText = JSON.stringify(data);

    row.appendChild(originCell);
    row.appendChild(dataCell);
    tableBody.appendChild(row);
  } catch (err) {
    console.error(err);
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  setHeaderRowColor();
  addControllBarAction();
});

const sendInjectContentScriptMessage = () => {
  try {
    backgroundPageConnection.postMessage({
      type: "init",
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "postMessageDevToolsContentScript.js",
    });
  } catch (err) {
    // The port died (e.g. the MV3 service worker was restarted). Reconnect
    // and retry once the new port is ready.
    console.log("Post Message Dev Tools: port disconnected, reconnecting...", err);
    connectToBackground();
  }
};

const connectToBackground = () => {
  backgroundPageConnection = chrome.runtime.connect({ name: "devToolsPanel" });

  backgroundPageConnection.onMessage.addListener((message) => {
    addTableRow(message.origin, message.data);
  });

  backgroundPageConnection.onDisconnect.addListener(() => {
    console.log("Post Message Dev Tools: background connection lost");
  });

  sendInjectContentScriptMessage();
};

// Init
let backgroundPageConnection;
connectToBackground();

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    sendInjectContentScriptMessage();
  }
});