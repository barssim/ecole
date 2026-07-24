import React from "react";
import OutingPage from "./OutingPage";

/**
 * MeetingPage — displays the school meetings (réunions) activity management.
 * Delegates all CRUD logic to OutingPage with activityType="reunions".
 */
const MeetingPage = ({ language }) => {
  return <OutingPage language={language} activityType="reunions" />;
};

export default MeetingPage;

