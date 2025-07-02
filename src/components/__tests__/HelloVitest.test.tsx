import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

describe('HelloVitest', () => {
  it('affiche le texte de test', () => {
    render(<div>Bonjour Vitest !</div>);
    expect(screen.getByText('Bonjour Vitest !')).toBeInTheDocument();
  });
}); 