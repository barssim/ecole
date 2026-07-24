import React from "react";
import OutingPage from "./OutingPage";

/**
 * PartiesPage — displays the school parties (fêtes) activity management.
 * Delegates all CRUD logic to OutingPage with activityType="fetes".
 */
const PartiesPage = ({ language }) => {
  return <OutingPage language={language} activityType="fetes" />;
};

export default PartiesPage;

