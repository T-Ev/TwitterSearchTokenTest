/* Twitter Search Tokenization UI Demo
 *  Author: TJ Evarts
 *  Date: 11/23/2022
 *  Version: 0.1.3
 *  Free to Use by anybody
 *
 *  Usage: Copy and paste this whole file into the js console of any twitter page that has a search box
 *  and start typing in search and some of the supported tokens defined below
 *
 *  Future Expansion
 *  Impliment the token Pre (prefix). Add all supported advanced search supported tokens. Maybe also add client side sorting features to add additional
 *  Capabilities to the search. Add bookmarks search token. Figure out how to load search results without refreshing page.
 */

//main search mod object
const search = {
  default: `<div class="list-item css-18t94o4 css-1dbjc4n r-1ny4l3l r-ymttw5 r-1f1sjgu"><div class="tokens r-b88u0q css-901oao">Gimme Some Letters...</div></div>`,
  //define supported tokens:
  tokenObjects: [
    {
      t: "from:",
      pre: "@",
      type: "text", //html input type to take advantage of formatting and native pickers
      q: (v) => `from:${v}`, //function used to resolve token to query string
      searchMethod: "users", //define what kind of suggestions script should show the user
    },
    {
      t: "to:",
      pre: "@",
      type: "text",
      q: (v) => `to:${v}`,
      searchMethod: "users",
    },
    {
      t: "mention:",
      pre: "@",
      type: "text",
      q: (v) => `(${v})`,
      searchMethod: "users",
    },
    {
      t: "before:",
      pre: " ",
      type: "date",
      q: (v) => `until:${v}`,
      searchMethod: "",
    },
    {
      t: "after:",
      pre: " ",
      type: "date",
      q: (v) => `since:${v}`,
      searchMethod: "",
    },
    {
      t: "exact:",
      pre: " ",
      type: "text",
      q: (v) => `"${v.substring(1)}"`,
      searchMethod: "",
    }, // This token below totally works! Uncomment to check it out:
    // {
    //   t: "time:",
    //   pre: " ",
    //   type: "time",
    //   q: (v) => `"${v}"`,
    //   searchMethod: "",
    // },
  ],

  //set up helper functions
  container: (val) => (document.querySelector(".filter-container").innerHTML = val),
  containerLive: (val) => (document.querySelector(".filter-container-live").innerHTML = val),
  listBox: () => document.querySelector("[role=listbox]") || document.querySelector("[role=search]"),
  input: () => document.querySelector("[data-testid=SearchBox_Search_Input]"),
  tokenTemplate: (key, value) => {
    return `<div class='token ${key}' >${key} ${value}</div>`;
  },
  liveTokenTemplate: (key, value) => {
    return `<div class='token ${key} live'>${value}</div>`;
  },

  //Inject Token CSS
  injectCSS: () => {
    var css = `
    .filter-container, .filter-container-live, .flex-center{
      white-space: nowrap;
    }
    .flex-center {
      align-items: center;
    }
    .filter-wrapper{
      max-width: 50%;
      overflow-x: hidden;
      white-space: nowrap;
      cursor:grab;
    }
    .token {
      white-space: nowrap;
      display: inline-block;
      padding: 3px 8px;
      background-color: #bbb;
      color: #222;
      border-radius: 1em;
    }
    .token.live{
      background-color:#888;
    }
    .token.live::after {
      content: "|";
      opacity: 0.1;
      animation: blink 0.5s infinite alternate;
    }
    @keyframes blink {
      0%{
        opacity:0.1;
      }
      100% {
        opacity:1;
      }
    }
    .list-item.active, .list-item:hover{
      background-color: rgb(29, 155, 240);
    }
    .list-item .text-wrap{
      display:inline-block;
    }
    .list-item .text-wrap, .list-item img{
      vertical-align:middle;
    }
    input:not([type=text]) {
      opacity:0;
    }
    .darkmode .list-item div{
      color: rgb(247, 249, 249);
    }
    .filter-wrapper.darkmode div{
      color: rgb(247, 249, 249);
    }
    `,
      head = document.head || document.getElementsByTagName("head")[0],
      style = document.createElement("style");
    head.appendChild(style);
    style.type = "text/css";
    style.id = "injected_css";
    if (style.styleSheet) {
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    search.input().parentNode.classList.add("flex-center");
  },

  //tokens are stored in data attributes in the search input tag
  init: () => {
    search.reset();
    search.injectCSS();
    //intialize dom containers
    search.input().parentNode.innerHTML = "<span class='filter-wrapper'><span class='filter-container r-n6v787'></span><span class='filter-container-live r-n6v787'></span></span>" + $("[data-testid=SearchBox_Search_Input]").parentNode.innerHTML;
    //add event listeners on input
    search.addListeners();
    search.input().dataset.tokens = "";
    search.input().dataset.liveToken = "";
    //mouse click and drag listeners for token container
    let slider = document.querySelector(".filter-wrapper");
    slider.addEventListener("mousedown", (e) => {
      search.slide.isDown = true;
      slider.classList.add("active");
      search.slide.startX = e.pageX - slider.offsetLeft;
      search.slide.scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
      search.slide.isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mouseup", () => {
      search.slide.isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mousemove", (e) => {
      if (!search.slide.isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - search.slide.startX) * 3; //scroll-fast
      slider.scrollLeft = search.slide.scrollLeft - walk;
    });
    //check for darkmode
    if (document.querySelector("body").style.backgroundColor !== "rgb(255, 255, 255)") {
      search.listBox().classList.add("darkmode");
      document.querySelector(".filter-wrapper").classList.add("darkmode");
    }
  },
  getTokens: (obj) => {
    if (!obj.dataset || !obj.dataset.tokens || obj.dataset.tokens === "") return [];
    else return JSON.parse(obj.dataset.tokens);
  },
  saveTokens: (obj, tokens) => {
    obj.dataset.tokens = JSON.stringify(tokens);
    return tokens;
  },
  liveToken: (obj, val) => {
    if (val || val === "") obj.dataset.liveToken = val;
    return obj.dataset.liveToken;
  },
  renderTokens: (obj) => {
    let res = "";
    search.getTokens(obj).forEach((ele) => {
      res += search.tokenTemplate(ele.k, ele.v);
    });
    return res;
  },
  renderLiveToken: (obj, input) => {
    return search.liveTokenTemplate(search.liveToken(obj), search.liveToken(obj) + input);
  },
  slide: { isDown: false, startX: 0, scrollLeft: 0 },
  addListeners: (e) => {
    search.input().addEventListener("input", search.tokenizer, false);
    search.input().addEventListener("keydown", search.inputHandler, false);
    search.input().addEventListener(
      "focus",
      (ev) => {
        setTimeout(() => {
          //attempt to attach listener to search clear button if it exists
          try {
            document.querySelector("[role=search] [data-testid=clearButton]").addEventListener("click", (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              search.input().dataset.tokens = "";
              search.input().dataset.liveToken = "";
              search.input().value = "";
              search.container("");
              search.containerLive("");
              search.clearList();
            });
          } catch {}
        }, 200);
      },
      false
    );
  },
  tokenizer: (e) => {
    let activeTok = "";
    if (
      search.tokenObjects
        .map((o) => o.t)
        .some((t) => {
          if (e.target.value.includes(t)) activeTok = t;
          return e.target.value.includes(t);
        }) > 0
    ) {
      search.liveToken(e.target, e.target.value);
      //clear input and make further text invisible;
      e.target.style.color = "transparent";
      e.target.style.width = "50%";
      e.target.type = search.tokenObjects.filter((o) => o.t === activeTok)[0].type;
      e.target.showPicker();
      if (e.target.type !== "text")
        setTimeout(() => {
          e.target.addEventListener(
            "change",
            (e) => {
              search.switchToken(e.target);
              let elClone = search.input().cloneNode(true);
              search.input().parentNode.replaceChild(elClone, search.input());
              search.addListeners();
              search.input().focus();
            },
            false
          );
        }, 200);
      e.target.value = " "; //this space is important
      search.clearList();
    }
    //update live token
    if (search.liveToken(e.target) !== "") {
      search.containerLive(search.renderLiveToken(e.target, e.target.value));
      let ltok = search.tokenObjects.filter((o) => search.liveToken(e.target) === o.t)[0];
      if (e.target.value.length > 1 && ltok.searchMethod !== "") search.predict(ltok.searchMethod, e.target.value);
      document.querySelector(".filter-wrapper").scrollLeft += 300;
    } else {
      search.predict("tokens", e.target.value);
    }
  },
  popToken: function (obj) {
    //Remove Last saved token from UI and memory
    let appended = search.getTokens(obj);
    appended.pop();
    search.saveTokens(obj, appended);
    search.container(search.renderTokens(obj));
  },
  inputHandler: (e) => {
    //look for keyboard navigation
    if (e.key === "Tab" || (e.key === "Enter" && search.liveToken(e.target) !== "" && !search.listBox().querySelector(".list-item.active"))) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Tab" && search.listBox().querySelector(".list-item.active")) {
        search.listBox().querySelector(".list-item.active").click();
        return;
      }
      search.switchToken(e.target);
    } else if (e.key === "Backspace" && e.target.value.length == 0) {
      e.target.style.color = "inherit";
      if (search.liveToken(e.target) === "") search.popToken(e.target);
      else {
        search.liveToken(e.target, "");
        search.containerLive("");
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      let actv = search.listBox().querySelector(".list-item.active");
      if (actv) {
        actv.classList.remove("active");
        let nxt = e.key === "ArrowDown" ? actv.nextSibling : actv.previousSibling;
        nxt.classList.add("active");
      } else {
        search.listBox().querySelector(".list-item").classList.add("active");
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (search.listBox().querySelector(".list-item.active")) {
        search.listBox().querySelector(".list-item.active").click();
        return;
      }
      //clear live tokens
      search.search(e.target);
    }
  },
  switchToken: (obj) => {
    //switch live token to saved token
    obj.style.color = "inherit";
    obj.type = "text";
    //add live token to tokens
    let appended = search.getTokens(obj);
    appended.push({ k: search.liveToken(obj), v: obj.value });
    search.saveTokens(obj, appended);
    search.container(search.renderTokens(obj));
    //clear live token
    search.liveToken(obj, "");
    search.containerLive("");
    obj.value = "";
    search.clearList();
    document.querySelector(".filter-wrapper").scrollLeft += 500;
  },
  getTokenString: (obj) => {
    //assemble query string from tokens
    return search
      .getTokens(obj)
      .map((o) => {
        let tok = search.tokenObjects.filter((f) => f.t === o.k)[0];
        return `${tok.q(o.v)} `;
      })
      .join("");
  },
  search: (obj) => {
    //simple version, anything further requires Twitter API
    window.open(`https://twitter.com/search?q=${search.getTokenString(obj)}${obj.value}`, "_self");
    // window.location = `https://twitter.com/search?q=${search.getTokenString(obj)}${obj.value}`;
  },
  predict: async (listType, query) => {
    //get type ahead list
    let url = null,
      userString = null,
      insert,
      list,
      hint;
    if (query) {
      if (query[0] == " ") query = query.substring(1);
      if (listType === "tokens") {
        insert = `<div class="list-item-name tokens r-b88u0q list-value">ele.t</div>`;
        list = search.tokenObjects;
        hint = "t";
      } else if (listType === "users") {
        insert = `<img class="r-sdzlij r-1b7u577" src="ele.profile_image_url_https"/><div class="text-wrap"><div class="list-item-name r-b88u0q">ele.name</div><div class="r-14j79pv list-item-username list-value">@ele.screen_name</div></div>`;
        userString = query.replace(" ", "");
        //v2 api - very limited:
        //url = "https://api.twitter.com/2/users/by?user.fields=created_at,description,name,profile_image_url,url,username,verified&usernames=" + query.replace(" ", "");
        //hint = "username";
        hint = "";
      }
      if (url != null) {
        const params = { method: "GET", headers: { Authorization: authorization_t } };
        list = await fetch(url, params)
          .then((data) => data.json())
          .then((data) => data.data);
      } else if (userString != null) {
        list = await search.getTypeAhead(userString).then((data) => JSON.parse(data).users);
      }
      if (list) search.renderList(list, insert, hint);
    }
  },
  renderList: (list, insert, hint = "") => {
    //render suggestions list
    //client side sorting:
    if (hint !== "") {
      list.sort((o1, o2) => o2[hint].indexOf(search.input().value));
    }
    let res = list
      .map((ele, i) => {
        let item = `<div data-index="${i}" class="list-item css-18t94o4 css-1dbjc4n r-1ny4l3l r-ymttw5 r-1f1sjgu"><div class="css-901oao">${insert}</div></div>`;
        delete ele["profile_image_url"];
        Object.keys(ele).forEach((e) => {
          item = item.replaceAll("ele." + e, ele[e]);
        });
        return item;
      })
      .join("");

    search.listBox().innerHTML = res;
    document.querySelectorAll(".list-item").forEach((box) => {
      box.addEventListener(
        "click",
        (e) => {
          search.input().value = e.target.closest(".list-item").querySelector(".list-value").innerHTML;
          search.tokenizer({ target: search.input() });
          search.input().focus();
          if (!e.target.closest(".list-item").querySelector(".list-value").classList.contains("tokens")) search.switchToken(search.input());
          setTimeout(search.clearList, 200);
        },
        false
      );
    });
    return res;
  },
  clearList: () => {
    search.listBox().innerHTML = search.default;
  },
  //Optional reset function that allows you to keep pasting this file into the js console multiple times without errors
  reset: () => {
    search.input().type = "text";
    search.input().style.color = "inherit";
    search.input().removeEventListener("input", search.tokenizer, true);
    search.input().removeEventListener("keydown", search.inputHandler, true);
    try {
      document.querySelector("#injected_css").remove();
      document.querySelector(".filter-container").remove();
      document.querySelector(".filter-container-live").remove();
    } catch {}
  },
  /* More twitter api 1.1 helper functions:
   * ===================================
   * The code below was by Yaroslav (@512x512), the mad lad cracking the private non-documented Twitter apis. Go show him some love!
   * ===================================
   */
  getCookie: (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  typeAheadUrl: "https://twitter.com/i/api/1.1/search/typeahead.json",
  getTypeAhead: (twitterHandle) => {
    return new Promise((resolve, reject) => {
      const requestUrl = new URL(search.typeAheadUrl);
      const csrfToken = search.getCookie("ct0");
      const gt = search.getCookie("gt");

      // constant in twitter js code
      const authorization = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

      requestUrl.searchParams.set("include_ext_is_blue_verified", 1);
      requestUrl.searchParams.set("q", `@${twitterHandle}`);
      requestUrl.searchParams.set("src", "search_box");
      requestUrl.searchParams.set("result_type", "users");

      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", requestUrl.toString(), false);
      xmlHttp.setRequestHeader("x-csrf-token", csrfToken);
      xmlHttp.setRequestHeader("x-twitter-active-user", "yes");

      if (search.getCookie("twid")) {
        //check if user is logged in
        xmlHttp.setRequestHeader("x-twitter-auth-type", "OAuth2Session");
      } else {
        xmlHttp.setRequestHeader("x-guest-token", gt);
      }
      xmlHttp.setRequestHeader("x-twitter-client-language", "en");
      xmlHttp.setRequestHeader("authorization", `Bearer ${authorization}`);

      xmlHttp.onload = (e) => {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status === 200) {
            resolve(xmlHttp.responseText);
          } else {
            reject(xmlHttp.statusText);
          }
        }
      };

      xmlHttp.onerror = (e) => {
        reject(xmlHttp.statusTexT);
      };

      xmlHttp.send(null);
    });
  },
};
search.init();
