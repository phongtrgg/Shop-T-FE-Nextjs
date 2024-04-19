import React, { useRef, ChangeEvent, useEffect } from 'react';

interface OtpInputProps {
  onComplete: (otp: string) => void;
  card: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ onComplete, card }) => {
  const inputsRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {

    if (!isNaN(Number(value)) && value !== '') {
      const nextIndex = index + 1;
      if (nextIndex < inputsRefs.current.length) {
        inputsRefs.current[nextIndex]?.focus();
      } else {
        onComplete(
          inputsRefs.current.map((input) => input?.value ?? '').join(''),
        );
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      e.key === 'Backspace' &&
      index > 0 &&
      inputsRefs.current[index]?.value === ''
    ) {
      inputsRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      {[...Array(card ? 4 : 6)].map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => (inputsRefs.current[index] = el)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(index, e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(index, e)
          }
          style={{
            width: '50px',
            height: '50px',
            margin: '10px',
            textAlign: 'center',
            borderRadius: '5px',
            border: '1px solid green',
            color: 'green',
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
