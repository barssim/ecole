import "../App.css";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import AdminBlock from "./MenuBlocks/AdminBlock";
import TeacherBlock from "./MenuBlocks/TeacherBlock";
import StudentBlock from "./MenuBlocks/StudentBlock";
import ParentBlock from "./MenuBlocks/ParentBlock";
import FinanceBlock from "./MenuBlocks/FinanceBlock";
import ServicesBlock from "./MenuBlocks/ServicesBlock";
import { hasAnyRole, normalizeRoles } from "../utils/roles";

const Menu = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const normalizedRoles = normalizeRoles(userRoles);
  const isAdminAuthorized = hasAnyRole(normalizedRoles, ["admin", "manager", "secretary"]);
  const canAccessAdminAttestations = hasAnyRole(normalizedRoles, ["admin", "manager", "secretary"]);

  const isTeacherAuthorized = hasAnyRole(normalizedRoles, ["teacher", "manager"]);

  const isStudentAuthorized = hasAnyRole(normalizedRoles, ["student", "manager"]);

  const isParentAuthorized = hasAnyRole(normalizedRoles, ["parent", "manager"]);
  const isFinanceAuthorized = hasAnyRole(normalizedRoles, ["finance", "manager"]);

  const isServicesAuthorized = hasAnyRole(normalizedRoles, ["student", "teacher", "admin", "manager", "parent", "finance", "secretary"]);

  const menuBlocks = [
    {
      component: (
        <AdminBlock
          content={content}
          isAuthorized={isAdminAuthorized}
          canAccessAttestations={canAccessAdminAttestations}
        />
      ),
      isAuthorized: isAdminAuthorized,
    },
    { component: <TeacherBlock content={content}  isAuthorized={isTeacherAuthorized}/> , isAuthorized : isTeacherAuthorized},
    { component: <StudentBlock content={content} isAuthorized={isStudentAuthorized}/>,isAuthorized : isStudentAuthorized},
    { component: <ParentBlock content={content} isAuthorized={isParentAuthorized}/> , isAuthorized : isParentAuthorized},
    { component: <ServicesBlock content={content} isAuthorized={isServicesAuthorized}/> , isAuthorized : isServicesAuthorized},
    { component: <FinanceBlock content={content} isAuthorized={isFinanceAuthorized}/> , isAuthorized : isFinanceAuthorized},
  ];

  // Sort authorized blocks first
  const sortedBlocks = menuBlocks.sort((a, b) => b.isAuthorized - a.isAuthorized);

  return (
    <div className="menu space-y-4 p-6 bg-sky-200 min-h-screen">
      {sortedBlocks.map((block, index) => (
        <div key={index}>{block.component}</div>
      ))}
    </div>
  );
};

export default Menu;

