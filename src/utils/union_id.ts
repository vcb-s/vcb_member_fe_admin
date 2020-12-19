import { useRef, useState } from 'react';

let shadowIndex = 0;

export const unionID = (): number => {
  shadowIndex += 1;
  return shadowIndex;
};

export const useUnionID = (): number => {
  const [id] = useState(() => unionID());
  return id;
};

export default unionID;
