// Public surface of the platform module.
// Everything that the host app (Next.js routes) needs to import is re-exported here,
// so the module can be lifted into another project by copying this folder and
// pointing your routes at these screens.

export { PlatformProvider, usePlatform } from "./store/PlatformContext";
export { LoginScreen } from "./screens/LoginScreen";

export { StudentDashboard } from "./screens/student/StudentDashboard";
export { StudentArea } from "./screens/student/StudentArea";
export { StudentClasses } from "./screens/student/StudentClasses";

export { TeacherDashboard } from "./screens/teacher/TeacherDashboard";
export { TeacherArea } from "./screens/teacher/TeacherArea";
export { TeacherClasses } from "./screens/teacher/TeacherClasses";

export { platformRoutes } from "./routes";
export { AREAS, findArea } from "./areas";

export type {
  Role,
  AuthState,
  Area,
  Question,
  QuestionKind,
  Checkpoint,
  Attempt,
  AttemptResult,
  ContentState,
} from "./types";
