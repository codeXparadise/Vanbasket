"use client";

import React, { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Wire this to an error reporting service before launch.
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-terracotta/10 border border-brand-terracotta/30 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-brand-terracotta"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-bold text-brand-espresso mb-2">
            Something went wrong
          </h2>
          <p className="font-sans text-xs text-brand-espresso-muted max-w-sm mb-6 leading-relaxed">
            An unexpected error occurred while rendering this section. Please refresh the page or return to the homepage.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 border border-brand-cream-dark/80 text-brand-espresso font-sans font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-brand-cream-warm/40 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-brand-espresso/90 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
