import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image - avoid JSX, use createElement instead
vi.mock('next/image', () => {
    const React = require('react');
    return {
        default: function MockImage(props: Record<string, unknown>) {
            return React.createElement('img', props);
        },
    };
});
