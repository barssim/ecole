const hostname = window.location.hostname;

let ecoleConfig;

if (hostname.includes("gardinia")) {
  ecoleConfig = require("./customizations/gardinia").default;
} else {
  ecoleConfig = require("./customizations/qods").default;
};

export default ecoleConfig;

