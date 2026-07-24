import React from "react";
import OuttingPage from "./OuttingPage";

/**
 * MeetingPage — displays the school meetings (réunions) activity management.
 * Delegates all CRUD logic to OuttingPage with activityType="reunions".
 */
const MeetingPage = ({ language }) => {
  return <OuttingPage language={language} activityType="reunions" />;
};

export default MeetingPage;

