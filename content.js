console.log("HTB Walkthroughs v1 -> Content Script Running!");
var addedNavItem = false;
var addedVideos = false;


const canAddSolutionNavItem = ()=>{
    const parentDiv=document.querySelector("#scrolling-techniques-7 > div.overflow-x-hidden > div:nth-child(2) > div > div > div.bg-color-blue-nav > div > div.col-md-9.col-12 > div > div > div.v-slide-group__wrapper > div")
    if(parentDiv.children.length===6){
        return true;
    }else{
        return false;
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "updateDescription") {
    
        // Function to check for the parentDiv and execute the rest of the code
        function checkForParentDiv() {
          var parentDiv = document.querySelector(
            "#scrolling-techniques-7 > div.overflow-x-hidden > div:nth-child(2) > div > div > div.bg-color-blue-nav > div > div.col-md-9.col-12 > div > div > div.v-slide-group__wrapper > div"
          );
    
          if (!parentDiv) {
            setTimeout(checkForParentDiv, 500); 
          } else {
            const newChild = document.createElement("div");
            const newSpan = document.createElement("span");
            newSpan.textContent = "Solutions";
            newSpan.setAttribute("class", "font-size14 fontRegular letterSpacing0");
            newChild.appendChild(newSpan);
            addedNavItem = true;
    
            newChild.setAttribute(
              "class",
              "tx-neue-haas-unica line-height20 mx-2 capitalize tab px-3 py-4 ml-0 mr-2 v-tab"
            );
    
            // Add event listener to trigger addVideo action
            newChild.addEventListener("click", () => {
              const updatedUrl = `https://app.hackthebox.com/machines/${getMachineTitle()}/solution`;
              history.pushState({}, "", updatedUrl);
            });
    
            if (canAddSolutionNavItem()) {
              parentDiv.appendChild(newChild);
            } 
          }
        }
    
        // Initial call to the function to start checking for the parentDiv
        checkForParentDiv();
      }else if (msg.action === "addVideo") {
    chrome.runtime.sendMessage(
      {
        command: "fetch",
        data: {
          machineTitle: getMachineTitle(),
        },
      },
      (response) => {
        if (response.status === "success") {
          insertVideoSolutions(
            response.data.results.filter((e, i) => {
              const title = e.video && e.video.title;
              return title && title.includes(getMachineTitle());
            })
          );
        } else {
          console.error("Failed to fetch video data:", response.data);
        }
      }
    );
  } else if (msg.action === "removeSolution") {
    removeSolution();
  }

  sendResponse({ result: "success" });
});

function getMachineTitle() {
  return (
    document.querySelector(
      "#machineProfileHeader > div.row.pb-8.px-8.maxWidth1280.mx-auto.no-gutters > div.col-md-5.col-12 > div > div.d-flex.flex-column.justify-center.align-start.ml-4.col > div:nth-child(1) > div > span"
    ).innerText || "Problem Title"
  );
}
function insertVideoSolutions(videos) {
    // Check if videos have already been added
    if (addedVideos) {
      return;
    }
    addedVideos = true;
  
    // Select the container where videos will be inserted
    const container = document.querySelector(
      "#scrolling-techniques-7 > div.overflow-x-hidden > div:nth-child(2) > div > div > div.bg-color-blue-bg.tab-item-container"
    );
  
    if (!container) {
      console.error("Solution container not found!");
      return;
    }
  
    setupContainerStyle(container);
    if(videos.length===0){
        const noVideos=document.createElement("span");
        noVideos.className="no-videos"
        noVideos.innerHTML=`<span class="fontSemiBold color-white font-size26"> No videos at the moment </span>
        <br><span>You can check the Official discussion thread for ${getMachineTitle()} <a href="https://forum.hackthebox.com/t/official-${getMachineTitle()}-discussion target="_blank">Here</a></span>`
   
        const supportDiv = createSupportDiv();
        container.insertAdjacentElement("afterbegin", supportDiv);
        container.insertAdjacentElement("afterbegin", noVideos);
      
        // Hide all children except the newly added elements
        hideOtherChildren(container, [supportDiv,noVideos]);
    }else{
        const videoContainer = createVideoContainer(videos);
        const navContainer = createNavContainer(videoContainer);
      
        // Insert elements into the container
        container.insertAdjacentElement("afterbegin", videoContainer);
        container.appendChild(navContainer);
        const supportDiv = createSupportDiv();
        container.insertAdjacentElement("afterbegin", supportDiv);
      
        // Hide all children except the newly added elements
        hideOtherChildren(container, [videoContainer, supportDiv, navContainer]);
    }

  

  }
  
  function setupContainerStyle(container) {
    container.style.display = "flex";
    container.style.flexDirection = "column";
  }
  
  function createVideoContainer(videos) {
    const videoContainer = document.createElement("div");
    videoContainer.className = "video-solutions";
    videoContainer.style.display = "flex";
    videoContainer.style.overflowX = "auto";
  
    videos.forEach((element) => {
      const videoFrame = createVideoFrame(element);
      videoContainer.appendChild(videoFrame);
    });
  
    return videoContainer;
  }
  
  function createVideoFrame(element) {
    const videoFrame = document.createElement("div");
    videoFrame.className = "video-frame";
    videoFrame.innerHTML = `
      <div class="video-content">
        <div class="video-details">
          <span class="video-title">${element.video.title}</span>
          <iframe src="https://www.youtube.com/embed/${element.video.id}" 
                  width="100%"
                  height="315"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>
        <div class="video-meta">
           <div>
                        <svg style="width: 15px; margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${element.video.duration}</span>
                    </div>
          <div>
                        <svg style="width: 15px; margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <span>${element.video.views}</span>
                    </div>
           <div>
                        <svg style="width: 15px; margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>${element.video.upload_date}</span>
                    </div>
          <div>
                    <svg xmlns="http://www.w3.org/2000/svg" style="width: 15px; margin-right: 8px;" width="15px" height="15px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
<path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                        <a href=${element.uploader.url}>${element.uploader.username}</a>
</div>
        </div>
      </div>
    `;
    return videoFrame;
  }
  
  function createNavContainer(videoContainer) {
    const navContainer = document.createElement("div");
    navContainer.className = "nav-container";
    navContainer.style.display = "flex";
    navContainer.style.alignSelf = "center";
    navContainer.style.marginBottom = "10px";
  
    const prevButton = createNavButton("prev", videoContainer);
    const nextButton = createNavButton("next", videoContainer);
  
    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);
  
    return navContainer;
  }
  
  function createNavButton(direction, videoContainer) {
    const button = document.createElement("button");
    button.className = "video-nav-button";
    button.innerHTML = direction === "prev" ? getPrevButtonSvg() : getNextButtonSvg();
    button.addEventListener("click", () => {
      const scrollAmount = videoContainer.scrollLeft + (direction === "prev" ? -videoContainer.clientWidth : videoContainer.clientWidth);
      videoContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
    });
    return button;
  }
  
  function getPrevButtonSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="margin:10px" xmlns:xlink="http://www.w3.org/1999/xlink" fill="white" height="25px" width="25px" version="1.1" id="Layer_1" viewBox="0 0 330 330" xml:space="preserve">
        <path id="XMLID_6_" d="M165,0C74.019,0,0,74.019,0,165s74.019,165,165,165s165-74.019,165-165S255.981,0,165,0z M205.606,234.394  c5.858,5.857,5.858,15.355,0,21.213C202.678,258.535,198.839,260,195,260s-7.678-1.464-10.606-4.394l-80-79.998  c-2.813-2.813-4.394-6.628-4.394-10.606c0-3.978,1.58-7.794,4.394-10.607l80-80.002c5.857-5.858,15.355-5.858,21.213,0  c5.858,5.857,5.858,15.355,0,21.213l-69.393,69.396L205.606,234.394z"/>
      </svg>`;
  }
  
  function getNextButtonSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="margin:10px" xmlns:xlink="http://www.w3.org/1999/xlink" fill="white" height="25px" width="25px" version="1.1" id="Layer_1" viewBox="0 0 330 330" xml:space="preserve">
        <path id="XMLID_2_" d="M165,0C74.019,0,0,74.019,0,165s74.019,165,165,165s165-74.019,165-165S255.981,0,165,0z M225.606,175.605  l-80,80.002C142.678,258.535,138.839,260,135,260s-7.678-1.464-10.606-4.394c-5.858-5.857-5.858-15.355,0-21.213l69.393-69.396  l-69.393-69.392c-5.858-5.857-5.858-15.355,0-21.213c5.857-5.858,15.355-5.858,21.213,0l80,79.998  c2.814,2.813,4.394,6.628,4.394,10.606C230,168.976,228.42,172.792,225.606,175.605z"/>
      </svg>`;
  }
  
  function createSupportDiv() {
    const supportDiv = document.createElement("div");
    supportDiv.className = "support-div";
    supportDiv.style.display = "flex";
    supportDiv.style.flexDirection = "column";
    supportDiv.style.alignSelf = "end";
    supportDiv.style.alignItems = "start";
    supportDiv.style.margin = "10px";
  
    const coffeeButton = document.createElement("a");
    coffeeButton.href = "https://www.buymeacoffee.com/slimsskhabh";
    coffeeButton.target = "_blank";
    coffeeButton.innerHTML = `<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 41.5px !important; width: 150px !important;">`;
    supportDiv.appendChild(coffeeButton);
  
    const whoMadeThis = document.createElement("a");
    whoMadeThis.href = "https://www.linkedin.com/in/slim-skhab/";
    whoMadeThis.target = "_blank";
    whoMadeThis.textContent = "Made By SlimSkhab";
    whoMadeThis.style.textDecoration = "none"; 
    whoMadeThis.style.color = "inherit";
    whoMadeThis.addEventListener("mouseover", () => { whoMadeThis.style.textDecoration = "underline"; });
    whoMadeThis.addEventListener("mouseout", () => { whoMadeThis.style.textDecoration = "none"; });
    supportDiv.appendChild(whoMadeThis);
  
    const githubButton = document.createElement("a");
    githubButton.href = "https://github.com/slimskhab/HTB-Walkthroughs";
    githubButton.target = "_blank";
    githubButton.style.display = "flex";
    githubButton.style.gap = "10px";
    githubButton.style.alignSelf = "end";
    githubButton.innerHTML = `<svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="25" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
    </svg><span>HTB WalkThroughs</span>`;
    supportDiv.appendChild(githubButton);
  
    return supportDiv;
  }
  
  function hideOtherChildren(container, keepElements) {
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!keepElements.includes(child)) {
        child.style.display = "none";
      }
    }
  }
  

function removeSolution() {
    const videoContainer = document.querySelector(".video-solutions");
    const videoNavButton = document.querySelector(".video-nav-button");
    const supportDiv = document.querySelector(".support-div");
    const noVideos=document.querySelector(".no-videos");
    const solutionsTab=document.querySelector(".solutions-tab");


    const container = document.querySelector(
      "#scrolling-techniques-7 > div.overflow-x-hidden > div:nth-child(2) > div > div > div.bg-color-blue-bg.tab-item-container"
    );
  
    if (container) {
      const children = Array.from(container.children);
      children.forEach(child => {
        if (
          !child.classList.contains("video-solutions") &&
          !child.classList.contains("video-nav-button") &&
          !child.classList.contains("support-div")
        ) {
          child.style.display = "block";
        }
      });
    }
  
    [videoContainer, videoNavButton, supportDiv,noVideos].forEach(element => {
      if (element) {
        element.remove();
      }
    });

    if (solutionsTab){
        solutionsTab.remove();
        addedNavItem=false;

    }
  
    addedVideos = false;
  }
  