import React from "react";
import OuttingPage from "./OuttingPage";

/**
 * PartiesPage — displays the school parties (fêtes) activity management.
 * Delegates all CRUD logic to OuttingPage with activityType="fetes".
 */
const PartiesPage = ({ language }) => {
  return <OuttingPage language={language} activityType="fetes" />;
};

export default PartiesPage;

