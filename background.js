console.log("HTB Walkthroughs v1 -> Background Script Running!");

const API_URL = "https://lvsapi.soumya.dev/api/search?q=";

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  if (msg.command == "fetch") {
    const { machineTitle } = msg.data;
    chrome.storage.local.get("videoSolutionsData", (oldData) => {
      const oldVideoSolutionsData = oldData.videoSolutionsData;

      // we are checking to not fetch if it is present AND the time data was fetched is <30 days
      let isPresentAlready = !!oldVideoSolutionsData.find(
        (dt) =>
          dt.id === machineTitle && Date.now() - dt.timestamp < 30 * 86400000
      );
      if (!isPresentAlready) {

        fetch(`${API_URL}${machineTitle} hack the box walkthrough htb`)
          .then((response) => response.json())
          .then((data) => {
            chrome.storage.local.get("videoSolutionsData", (oldData) => {
              const oldVideoSolutionsData = oldData.videoSolutionsData.filter(
                (dt) => dt.id !== machineTitle
              );
              // data -> {videoSolutionsData: []}
              const newVideoSolutionsData = [
                ...oldVideoSolutionsData,
                { id: machineTitle, data, timestamp: Date.now() },
              ];
              chrome.storage.local.set({
                videoSolutionsData: newVideoSolutionsData,
              });
            });
            resp({
              type: "result",
              status: "success",
              data: data,
              request: msg,
            });
          })
          .catch((e) => {
            resp({
              type: "result",
              status: "error",
              data: e,
              request: msg,
            });
          });
      } else {
        const oldVideoSolutionsData = oldData.videoSolutionsData;
        const neededData = oldVideoSolutionsData.find(
          (dt) => dt.id === machineTitle
        );
        resp({
          type: "result",
          status: "success",
          data: neededData.data,
          request: msg,
        });
      }
    });
  }
  return true;
});

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  if (msg.command == "fetchOld") {
    const { problemId, machineTitle } = msg.data;
    fetch(`${API_URL}leetcode ${problemId} ${machineTitle} solution`)
      .then((response) => response.json())
      .then((data) => {
        resp({
          type: "result",
          status: "success",
          data: data,
          request: msg,
        });
      })
      .catch((e) => {
        resp({
          type: "result",
          status: "error",
          data: e,
          request: msg,
        });
      });
  }

  return true;
});


chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({ videoSolutionsData: [] }, function () {
  });
  const currentVersion = chrome.runtime.getManifest().version;
  if (
    currentVersion === "5.0.0" ||
    currentVersion === "5.0.1" ||
    currentVersion === "5.0.2"
  ) {
    chrome.storage.local.set({ toShowNewUIAnnouncement: true }, function () {
      console.log("toShowNewUIAnnouncement true init");
    });
    chrome.storage.local.set({ toHighlightSolutionsTab: true }, function () {
      console.log("toHighlightSolutionsTab true init");
    });
  }
  // Load JSON file into storage
  //   const jsonUrl = chrome.runtime.getURL(
  //     "src/assets/data/leetcode_solutions.json"
  //   );
  //   print(jsonUrl);
  //   fetch(jsonUrl)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       chrome.storage.local.set({ leetcodeProblems: data });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  //   // Default settings
  //   chrome.storage.local.set({ language: "python" });
  //   chrome.storage.local.set({ fontSize: 14 });
  //   chrome.storage.local.set({ showCompanyTags: true });
  //   chrome.storage.local.set({ showExamples: true });
  //   chrome.storage.local.set({ showDifficulty: true });
  //   chrome.storage.local.set({ clickedCompany: "Amazon" });
  //   chrome.storage.local.set({ showRating: true });
});
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.action == "openSolutionVideo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let url = tabs[0].url;
      if (url) {
        // Remove /description/ if it exists
        url = url.replace(/\/description\//, "/");
        // Ensure the URL ends with /
        if (!url.endsWith("/")) {
          url += "/";
        }
        // Append solutions/
        const newUrl = url + "solutions/";
        if (tabs.length > 0 && tabs[0].id) {
          const tabId = tabs[0].id;
          const updateProperties = { url: newUrl };
          chrome.tabs.update(tabId, updateProperties);
        }
      }
    });
    sendResponse({ result: "Success" });
  }
});
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "openCompanyPage") {
    chrome.storage.local.set({ clickedCompany: request.company });
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL("src/problems-by-company/company.html"),
        active: true,
      },
      function (tab) {
        // Keep a reference to the listener so it can be removed later
        const listener = function (tabId, changedProps) {
          // When the tab is done loading
          if (tabId == tab.id && changedProps.status == "complete") {
            chrome.tabs.sendMessage(tabId, request);
            // Remove the listener once the tab is loaded
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        // Attach the listener
        chrome.tabs.onUpdated.addListener(listener);
      }
    );
  }
});

// If the user is on a Hack The Box page, show the solution video or company tags.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let urlPattern = /^https:\/\/app\.hackthebox\.com\/machines\/[^\/?]+$/;
  let urlItems = tab.url.split("/");
  if (urlItems[2] !== "app.hackthebox.com") {
    return;
  }
  let lastUrlItem = urlItems[urlItems.length - 1];

  setTimeout(() => {
    chrome.tabs.get(tabId, (updatedTab) => {
      chrome.tabs.sendMessage(tabId, {
        action: "removeSolution",
        title: updatedTab.title || "title",
      });
    });
    haveSolutionTab = false;
  }, 1000);

  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.match(urlPattern) &&
    lastUrlItem !== "solution" &&
    lastUrlItem !== "machines"
  ) {
      setTimeout(() => {
        chrome.tabs.get(tabId, (updatedTab) => {
          chrome.tabs.sendMessage(tabId, {
            action: "updateDescription",
            title: updatedTab.title || "title",
          });
        });
        haveSolutionTab = true;
      }, 1000);
    
  }
  // If solutions tab is opened or updated, add the video
  urlPattern = /^https:\/\/app\.hackthebox\.com\/machines\/[^\/]+\/solution\/?/;
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    lastUrlItem === "solution"
  ) {
    setTimeout(() => {
      chrome.tabs.get(tabId, (updatedTab) => {
        chrome.tabs.sendMessage(tabId, {
          action: "addVideo",
          title: updatedTab.title || "title",
        });
      });
    }, 1000);
  }
  // // If problem tab is opened or updated, update the current problem title
  // urlPattern = /^https:\/\/leetcode\.com\/problems\/.*\/?/;
  // if (changeInfo.status === 'complete' && tab.url && tab.url.match(urlPattern)) {
  //     setTimeout(() => {
  //         chrome.storage.local.set({ 'currentLeetCodeProblemTitle': tab.title || 'title' });
  //     }, 1000);
  // }
});
