// Public surface of the platform module.
// Everything that the host app (Next.js routes) needs to import is re-exported here,
// so the module can be lifted into another project by copying this folder and
// pointing your routes at these screens.

export { PlatformProvider, usePlatform } from "./store/PlatformContext";
export { LoginScreen } from "./screens/LoginScreen";

export { StudentDashboard } from "./screens/student/StudentDashboard";
export { StudentMaterials } from "./screens/student/StudentMaterials";
export { StudentClasses } from "./screens/student/StudentClasses";

export { TeacherDashboard } from "./screens/teacher/TeacherDashboard";
export { TeacherMaterials } from "./screens/teacher/TeacherMaterials";
export { TeacherClasses } from "./screens/teacher/TeacherClasses";

export { FlashcardsList } from "./screens/flashcards/FlashcardsList";
export { DeckOverview } from "./screens/flashcards/DeckOverview";
export { DeckStudy } from "./screens/flashcards/DeckStudy";
export { DeckCards } from "./screens/flashcards/DeckCards";

export { platformRoutes } from "./routes";
export { reschedule, isDue, countDue, dueCards } from "./scheduler";

export type {
  Role,
  AuthState,
  Checkpoint,
  ContentState,
  Material,
  MaterialSection,
  Deck,
  Flashcard,
  Grade,
  OwnerScope,
} from "./types";
