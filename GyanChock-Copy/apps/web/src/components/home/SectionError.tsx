'use client';

import { Component, type ReactNode } from 'react';

export class SectionError extends Component<{ children: ReactNode; label?: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="gc-container py-10 text-center">
          <p className="text-sm text-gc-mute">{this.props.label ?? 'This section could not load.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
