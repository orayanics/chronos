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
      <button
        type="button"
        className="btn"
        onClick={() => setIsSettingsOpen(true)}
      >
        Settings
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => setIsSessionsOpen(true)}
      >
        Sessions
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => setIsTasksOpen(true)}
      >
        Tasks
      </button>
    </footer>
  );
}
