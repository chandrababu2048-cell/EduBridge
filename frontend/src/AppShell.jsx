// AppShell — thin wrapper that renders the full gamified App at /app
// The existing App.jsx is not modified; this shell simply mounts it.
import App from './App.jsx';

export default function AppShell() {
  return <App />;
}
