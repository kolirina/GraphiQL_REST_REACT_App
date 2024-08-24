// AuthForm.test.tsx
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthForm, { AuthFormInputs } from './AuthForm';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { AuthFormSchema } from '@/validation/authSchema';

vi.mock('react-icons/ai', () => ({
  AiFillEye: () => <span>eye</span>,
  AiFillEyeInvisible: () => <span>eye-invisible</span>,
}));

describe('AuthForm', () => {
  it('renders form fields correctly based on isRegistering prop', () => {
    render(<AuthForm isRegistering={true} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders form fields correctly in login mode', () => {
    render(<AuthForm isRegistering={false} onSubmit={vi.fn()} />);

    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<AuthForm isRegistering={true} onSubmit={vi.fn()} />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const eyeIcon = screen.getByTestId('password-toggle-icon');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(eyeIcon);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(eyeIcon);
    expect(passwordInput.type).toBe('password');
  });

  it('toggles confirm password visibility when eye icon is clicked', () => {
    render(<AuthForm isRegistering={true} onSubmit={vi.fn()} />);

    const confirmPasswordInput = screen.getByLabelText(
      'Confirm Password'
    ) as HTMLInputElement;
    const eyeIconConfirm = screen.getByTestId('confirm-password-toggle-icon');

    expect(confirmPasswordInput.type).toBe('password');

    fireEvent.click(eyeIconConfirm);
    expect(confirmPasswordInput.type).toBe('text');

    fireEvent.click(eyeIconConfirm);
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('submits form with correct data', async () => {
    const onSubmit = vi.fn();
    render(<AuthForm isRegistering={true} onSubmit={onSubmit} />);

    fireEvent.input(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'P@ssw0rd!' },
    });
    fireEvent.input(screen.getByLabelText('Confirm Password'), {
      target: { value: 'P@ssw0rd!' },
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      const expectedData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd!',
        confirmPassword: 'P@ssw0rd!',
      };

      const actualData = onSubmit.mock.calls[0][0];

      expect(actualData).toEqual(expectedData);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
