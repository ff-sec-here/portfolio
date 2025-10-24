import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogPostPage from './page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'spring-boot-actuator-info-disclosure-bypass' }),
  useRouter: () => ({}),
}));

describe('BlogPostPage', () => {
  it('renders markdown content', async () => {
    render(<BlogPostPage />);
    // Wait for the markdown content to be rendered
    const markdownContent = await screen.findByText(/Greetings, community!/);
    expect(markdownContent).toBeInTheDocument();
  });
});
