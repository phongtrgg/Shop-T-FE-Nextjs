import { useState } from 'react';

function CountdownTimer() {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  function startCountdown() {
    let intervalId: any;
    if (isActive) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            clearInterval(intervalId);
            setIsActive(false);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return {
    minutes,
    remainingSeconds,
    startCountdown,
    isActive,
    setIsActive,
    seconds,
    setSeconds,
  };
}
export default CountdownTimer;
