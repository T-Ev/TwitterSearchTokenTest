/* Twitter Search Tokenization UI Demo
 *  Author: TJ Evarts
 *  Date: 11/23/2022
 *  Free to Use by anybody
 *
 *  Usage: Copy and paste this whole file into the js console of any twitter page that has a search box
 *  and start typing in search and some of the supported tokens defined below
 *
 *  Future Expansion
 *  Ideally autocomplete or live suggestions are shown as tokens are being typed, but this requires directly accessing the
 *  Twitter API which was beyond the scope of a paste in console demo. Feel free to fork and modify to be more stand alone.
 */

//Optional reset function that allows you to keep pasting this file into the js console multiple times without errors
const reset = () => {
  search.input().removeEventListener("input", search.tokenizer, true);
  search.input().removeEventListener("keydown", search.focusHandler, true);
  try {
    document.querySelector(".filter-container").remove();
    document.querySelector(".filter-container-live").remove();
  } catch {}
};

//main search mod object
const search = {
  //define supported tokens:
  tokens: ["from:", "is:", "to:"],
  //set up helper functions
  container: (val) => (document.querySelector(".filter-container").innerHTML = val),
  containerLive: (val) => (document.querySelector(".filter-container-live").innerHTML = val),
  input: () => document.querySelector("[data-testid=SearchBox_Search_Input]"),
  tokenTemplate: (key, value) => {
    return `<div data-key='${key}' style='white-space:nowrap;display:inline-block;margin-top: 5px;vertical-align:middle;padding:5px 10px;background-color:#bbb;color:#222;border-radius: 1em;'>${key} ${value}</div>`;
  },
  liveTokenTemplate: (key, value) => {
    return `<div data-key='${key} live' style='white-space:nowrap;isplay:inline-block;margin-top: 5px;vertical-align:middle;padding:5px 10px;background-color:#888;color:#fff;border-radius: 1em;'>${value}</div>`;
  },
  //intialize containers
  //tokens are stored in data attributes in the search input tag
  init: () => {
    reset();
    search.input().parentNode.innerHTML = "<span style='white-space: nowrap;' class='filter-container'></span><span style='white-space: nowrap;' class='filter-container-live'></span>" + $("[data-testid=SearchBox_Search_Input]").parentNode.innerHTML;
    search.input().addEventListener("input", search.tokenizer, false);
    search.input().addEventListener("keydown", search.focusHandler, false);
    search.input().dataset.tokens = "";
    search.input().dataset.liveToken = "";
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
  tokenizer: (e) => {
    if (search.tokens.some((t) => e.target.value.includes(t)) > 0) {
      search.liveToken(e.target, e.target.value);
      //clear input and make further text invisible;
      e.target.style.color = "transparent";
      e.target.style.width = "50%";
      e.target.value = " "; //this space is important
    }
    //update live token
    if (search.liveToken(e.target) !== "") {
      search.containerLive(search.renderLiveToken(e.target, e.target.value));
    }
  },
  popToken: function (obj) {
    let appended = search.getTokens(obj);
    appended.pop();
    search.saveTokens(obj, appended);
    search.container(search.renderTokens(obj));
  },
  focusHandler: (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.target.style.color = "inherit";
      //add live token to tokens
      let appended = search.getTokens(e.target);
      appended.push({ k: search.liveToken(e.target), v: e.target.value });
      search.saveTokens(e.target, appended);
      search.container(search.renderTokens(e.target));
      //clear live token
      search.liveToken(e.target, "");
      search.containerLive("");
      e.target.value = "";
    } else if (e.key === "Backspace" && e.target.value.length == 0) {
      e.target.style.color = "inherit";
      if (search.liveToken(e.target) === "") search.popToken(e.target);
      else {
        search.liveToken(e.target, "");
        search.containerLive("");
      }
    } else if (e.key === "Enter") {
      search.search(e.target);
    }
  },
  getTokenString: (obj) => {
    return search
      .getTokens(obj)
      .map((o) => `${o.k}${o.v} `)
      .join("");
  },
  search: (obj) => {
    //simple version, anything further requires Twitter API
    window.location = "https://twitter.com/search?q=" + escape(`${search.getTokenString(obj)}${obj.value}`);
  },
};
search.init();
