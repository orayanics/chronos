import { FaCog, FaClock, FaThList } from "react-icons/fa";
interface FooterProps {
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsSessionsOpen: (isOpen: boolean) => void;
  setIsTasksOpen: (isOpen: boolean) => void;
}

export default function Footer({
  setIsSettingsOpen,
  setIsSessionsOpen,
  setIsTasksOpen,
}: FooterProps) {
  return (
    <footer className="fixed bottom-0 w-full text-center bg-white border-t border-gray-300 py-2 space-x-3">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className="btn shadow-none! hover:text-pinkish"
          onClick={() => setIsSettingsOpen(true)}
        >
          <FaCog className="inline-block" />
          <p className="text-xs">Settings</p>
        </button>

        <button
          type="button"
          className="btn shadow-none! hover:text-pinkish"
          onClick={() => setIsSessionsOpen(true)}
        >
          <FaClock className="inline-block" />
          <p className="text-xs">Sessions</p>
        </button>

        <button
          type="button"
          className="btn shadow-none! hover:text-pinkish"
          onClick={() => setIsTasksOpen(true)}
        >
          <FaThList className="inline-block" />
          <p className="text-xs">Tasks</p>
        </button>
      </div>
    </footer>
  );
}
