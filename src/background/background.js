import { readUserSettings } from "../common/readUserSettings";
import { fetchNeighbourhoodMeta, fetchNeighbourhoodStats } from "./api";

import { getProperties, selectDefaultProperties } from "./utils";

chrome.runtime.onInstalled.addListener(selectDefaultProperties);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    return;
  }

  const { zipCode } = request;

  fetchNeighbourhoodMeta(zipCode).then(async neighbourhoodMeta => {
    if (neighbourhoodMeta.error) {
      console.error(neighbourhoodMeta.error);
      sendResponse({ error: neighbourhoodMeta.error });
      return;
    }

    const { neighbourhoodCode, neighbourhoodName, municipalityName } = neighbourhoodMeta;

    const neighbourhood = await fetchNeighbourhoodStats(neighbourhoodCode);

    const neighbourhoodWithMeta = {
      neighbourhoodName: { value: neighbourhoodName },
      municipalityName: { value: municipalityName },
      ...neighbourhood,
    };

    const userSettings = await readUserSettings();

    const { badgeProperties, tableProperties } = getProperties(neighbourhoodWithMeta, userSettings);

    sendResponse({ badgeProperties, tableProperties });
  });

  return true;
});
