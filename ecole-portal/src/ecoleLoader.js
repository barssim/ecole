import { getTenantId } from "./tenant";

const customizationMap = {
  gardinia: () => require("./customizations/gardinia").default,
  qods: () => require("./customizations/qods").default,
};

const tenantId = getTenantId();
const loadCustomization = customizationMap[tenantId] || customizationMap.qods;

export default loadCustomization();

