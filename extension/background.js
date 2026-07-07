const APP_URL = "https://abdi-premium.lovable.app/";
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: APP_URL });
});
