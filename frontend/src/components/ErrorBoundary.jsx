import React from "react";
import { AlertTriangle } from "lucide-react";

// Wraps a section of the tree (e.g. one tab's page component) so that a
// render error there shows a readable message instead of taking the whole
// app blank. Without a boundary like this, React 18 unmounts everything
// above the crash on an uncaught render error, which is why one broken
// component can make the *entire* page (not just its own tab) go blank.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaces the real stack trace in the dev console instead of it being
    // swallowed by a blank screen.
    console.error("Render error in", this.props.label || "page", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto mt-10 bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
            <AlertTriangle className="h-5 w-5" />
            Something went wrong{this.props.label ? ` rendering "${this.props.label}"` : ""}.
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Check the browser console for the full stack trace — the error below is
            usually enough to tell you which component and line to look at.
          </p>
          <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto whitespace-pre-wrap">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 text-sm font-medium text-saffron-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}